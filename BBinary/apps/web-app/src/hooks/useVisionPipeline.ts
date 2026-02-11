import { useEffect, useRef, useState, useCallback } from 'react';
import { FaceLandmarker, ObjectDetector, PoseLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import * as ort from 'onnxruntime-web';

// Configure onnxruntime-web globally.
ort.env.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.24.1/dist/';
ort.env.wasm.numThreads = 1;

export interface EmotionResult {
    emotion: string;
    confidence: number;
}

export interface ObjectDetection {
    category: string;
    score: number;
    bbox?: {
        originX: number;
        originY: number;
        width: number;
        height: number;
    };
}

export interface VisionPipelineResult {
    emotion: EmotionResult;
    objects: ObjectDetection[];
    isFalling: boolean;
    isHydrating: boolean;
    isLoading: boolean;
    error: string | null;

}

export const useVisionPipeline = (videoElement: HTMLVideoElement | null): VisionPipelineResult => {
    const [emotion, setEmotion] = useState<EmotionResult>({ emotion: 'Neutral', confidence: 0 });
    const [objects, setObjects] = useState<ObjectDetection[]>([]);
    const [isFalling, setIsFalling] = useState(false);
    const [isHydrating, setIsHydrating] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const faceLandmarkerRef = useRef<FaceLandmarker | null>(null);
    const objectDetectorRef = useRef<ObjectDetector | null>(null);
    const poseLandmarkerRef = useRef<PoseLandmarker | null>(null);
    const sessionRef = useRef<ort.InferenceSession | null>(null);
    const requestRef = useRef<number | null>(null);

    useEffect(() => {
        const initModels = async () => {
            try {
                setIsLoading(true);

                const filesetResolver = await FilesetResolver.forVisionTasks(
                    "/models"
                );

                // 1. Initialize Face Landmarker
                faceLandmarkerRef.current = await FaceLandmarker.createFromOptions(filesetResolver, {
                    baseOptions: {
                        modelAssetPath: '/models/face_landmarker.task',
                        delegate: "GPU"
                    },
                    outputFaceBlendshapes: true,
                    runningMode: "VIDEO",
                    numFaces: 1
                });

                // 2. Initialize Object Detector
                objectDetectorRef.current = await ObjectDetector.createFromOptions(filesetResolver, {
                    baseOptions: {
                        modelAssetPath: '/models/efficientdet_lite0.tflite',
                        delegate: "GPU"
                    },
                    runningMode: "VIDEO",
                    scoreThreshold: 0.5
                });

                // 3. Initialize Pose Landmarker (for Fall Detection)
                poseLandmarkerRef.current = await PoseLandmarker.createFromOptions(filesetResolver, {
                    baseOptions: {
                        modelAssetPath: '/models/pose_landmarker.task',
                        delegate: "GPU"
                    },
                    runningMode: "VIDEO",
                    numPoses: 1
                });

                // 4. Initialize Emotion ONNX Session
                sessionRef.current = await ort.InferenceSession.create('/models/emotion_model_no_zipmap.onnx');

                setIsLoading(false);
            } catch (err: any) {
                console.error("Vision Pipeline Init Error:", err);
                setError(err.message || "Failed to load vision models");
                setIsLoading(false);
            }
        };

        initModels();

        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
            if (faceLandmarkerRef.current) faceLandmarkerRef.current.close();
            if (objectDetectorRef.current) objectDetectorRef.current.close();
            if (poseLandmarkerRef.current) poseLandmarkerRef.current.close();
        };
    }, []);

    const lastEmotionUpdateRef = useRef<number>(0);
    const lastObjectUpdateRef = useRef<number>(0);
    const lastPoseUpdateRef = useRef<number>(0);

    // Heuristic State
    const lastTorsoYRef = useRef<number | null>(null);
    const fallCounterRef = useRef<number>(0);
    const hydrationCounterRef = useRef<number>(0);

    const predict = useCallback(async () => {
        if (!videoElement || videoElement.readyState < 2) {
            requestRef.current = requestAnimationFrame(predict);
            return;
        }

        const now = performance.now();

        // --- 1. Emotion Detection (2s) ---
        if (faceLandmarkerRef.current && sessionRef.current && now - lastEmotionUpdateRef.current >= 2000) {
            const results = faceLandmarkerRef.current.detectForVideo(videoElement, now);
            if (results.faceBlendshapes && results.faceBlendshapes.length > 0) {
                const blendshapes = results.faceBlendshapes[0].categories;
                const scores = new Float32Array(52);
                blendshapes.forEach(b => {
                    if (b.index >= 0 && b.index < 52) scores[b.index] = b.score;
                });

                const inputTensor = new ort.Tensor('float32', scores, [1, 52]);
                try {
                    const outputMap = await sessionRef.current.run({ X: inputTensor });
                    const labelValue = (outputMap.output_label.data[0] as string);
                    const formattedLabel = labelValue.charAt(0).toUpperCase() + labelValue.slice(1);

                    let conf = 95;
                    if (outputMap.output_probability?.data) {
                        conf = Math.max(...Array.from(outputMap.output_probability.data as Float32Array)) * 100;
                    }

                    setEmotion({ emotion: formattedLabel, confidence: conf });
                    lastEmotionUpdateRef.current = now;
                } catch (e) {
                    console.error("Emotion Error:", e);
                }
            }
        }

        // --- 2. Object Detection (1s) & Hydration Heuristics ---
        if (objectDetectorRef.current && now - lastObjectUpdateRef.current >= 1000) {
            try {
                const detections = objectDetectorRef.current.detectForVideo(videoElement, now);
                const mapped = detections.detections.map(d => ({
                    category: d.categories[0].categoryName,
                    score: d.categories[0].score,
                    bbox: d.boundingBox
                }));
                setObjects(mapped);

                // Hydration Detection: cup, bottle, or wine glass near the face (upper portion of frame)
                const drinkingObjects = mapped.filter(obj =>
                    (obj.category === 'bottle' || obj.category === 'cup' || obj.category === 'wine glass' || obj.category === 'glass') &&
                    obj.score > 0.4 &&
                    obj.bbox && (obj.bbox.originY / (videoElement.videoHeight || 1)) < 0.7 // In upper 70% of screen
                );

                if (drinkingObjects.length > 0) {
                    hydrationCounterRef.current++;
                } else {
                    hydrationCounterRef.current = Math.max(0, hydrationCounterRef.current - 1);
                }

                // Trigger after 2 consecutive detections (~2s)
                setIsHydrating(hydrationCounterRef.current >= 2);

                lastObjectUpdateRef.current = now;
            } catch (e) {
                console.error("Object Error:", e);
            }
        }

        // --- 3. Fall Detection (100ms for responsiveness) ---
        if (poseLandmarkerRef.current && now - lastPoseUpdateRef.current >= 100) {
            try {
                const results = poseLandmarkerRef.current.detectForVideo(videoElement, now);
                if (results.landmarks && results.landmarks.length > 0) {
                    const landmarks = results.landmarks[0];

                    // Nose (0), Shoulders (11, 12), Hips (23, 24)
                    const torsoY = (landmarks[11].y + landmarks[12].y + landmarks[23].y + landmarks[24].y) / 4;
                    const shoulderWidth = Math.abs(landmarks[11].x - landmarks[12].x);
                    const torsoHeight = Math.abs(torsoY - landmarks[0].y);

                    // 1. Vertical Velocity Heuristic
                    const dt = (now - lastPoseUpdateRef.current) / 1000;
                    if (lastTorsoYRef.current !== null) {
                        const vy = (torsoY - lastTorsoYRef.current) / dt;

                        // 2. Aspect Ratio / Orientation Heuristic
                        // If torso is becoming very "short" (lying down) and moving fast
                        const isHorizontal = shoulderWidth > torsoHeight * 1.5;
                        const isMovingFastDown = vy > 0.5; // Significant downward movement

                        if (isMovingFastDown || (isHorizontal && torsoY > 0.6)) {
                            fallCounterRef.current++;
                        } else {
                            fallCounterRef.current = Math.max(0, fallCounterRef.current - 1);
                        }

                        // Trigger after consistent detection (3 frames ~300ms)
                        setIsFalling(fallCounterRef.current > 3);
                    }

                    lastTorsoYRef.current = torsoY;
                    lastPoseUpdateRef.current = now;
                } else {
                    setIsFalling(false);
                    lastTorsoYRef.current = null;
                }
            } catch (e) {
                console.error("Pose Error:", e);
            }
        }

        requestRef.current = requestAnimationFrame(predict);
    }, [videoElement]);

    useEffect(() => {
        if (!isLoading && !error && videoElement) {
            requestRef.current = requestAnimationFrame(predict);
        }
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [isLoading, error, videoElement, predict]);

    return { emotion, objects, isFalling, isHydrating, isLoading, error };
};
