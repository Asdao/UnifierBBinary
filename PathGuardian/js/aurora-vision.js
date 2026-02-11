/**
 * Aurora Vision - ML Pipeline Integration
 * Powered by MediaPipe and ONNX Runtime Web
 */
(function () {

    let faceLandmarker, objectDetector, poseLandmarker, emotionSession;
    let isInitialized = false;

    // State
    const state = {
        emotion: 'Neutral',
        confidence: 0,
        objects: [],
        isFalling: false,
        isHydrating: false,
        isLoading: true,
        error: null
    };

    async function init() {
        if (isInitialized) return;
        try {
            console.log("Initializing Vision Models...");
            const { FilesetResolver, FaceLandmarker, ObjectDetector, PoseLandmarker } = await import('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.32');
            const ort = await import('https://cdn.jsdelivr.net/npm/onnxruntime-web@1.24.1/dist/ort.min.js');

            // Fix for ONNX WASM paths in browser
            ort.env.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.24.1/dist/';

            const filesetResolver = await FilesetResolver.forVisionTasks(
                "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.32/wasm"
            );

            // 1. Face Landmarker
            faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
                baseOptions: {
                    modelAssetPath: '/models/face_landmarker.task',
                    delegate: "GPU"
                },
                outputFaceBlendshapes: true,
                runningMode: "VIDEO",
                numFaces: 1
            });

            // 2. Object Detector
            objectDetector = await ObjectDetector.createFromOptions(filesetResolver, {
                baseOptions: {
                    modelAssetPath: '/models/efficientdet_lite0.tflite',
                    delegate: "GPU"
                },
                runningMode: "VIDEO",
                scoreThreshold: 0.5
            });

            // 3. Pose Landmarker
            poseLandmarker = await PoseLandmarker.createFromOptions(filesetResolver, {
                baseOptions: {
                    modelAssetPath: '/models/pose_landmarker.task',
                    delegate: "GPU"
                },
                runningMode: "VIDEO",
                numPoses: 1
            });

            // 4. Emotion Session
            emotionSession = await ort.InferenceSession.create('/models/emotion_model_no_zipmap.onnx');

            state.isLoading = false;
            isInitialized = true;
            console.log("Vision Pipeline Ready");
        } catch (err) {
            console.error("Vision Init Error:", err);
            state.error = err.message;
            state.isLoading = false;
        }
    }

    let lastTorsoY = null;
    let fallCounter = 0;
    let hydrationCounter = 0;

    async function analyze(videoElement) {
        if (!isInitialized) await init();
        if (!isInitialized || !videoElement || videoElement.readyState < 2) return state;

        const now = performance.now();

        // 1. Emotion
        if (faceLandmarker && emotionSession) {
            const results = faceLandmarker.detectForVideo(videoElement, now);
            if (results.faceBlendshapes?.length > 0) {
                const blendshapes = results.faceBlendshapes[0].categories;
                const scores = new Float32Array(52);
                blendshapes.forEach(b => { if (b.index >= 0 && b.index < 52) scores[b.index] = b.score; });

                const inputTensor = new ort.Tensor('float32', scores, [1, 52]);
                try {
                    const outputMap = await emotionSession.run({ X: inputTensor });
                    const label = (outputMap.output_label.data[0]);
                    state.emotion = label.charAt(0).toUpperCase() + label.slice(1);
                    state.confidence = 95; // Default helper
                } catch (e) { }
            }
        }

        // 2. Objects & Hydration
        if (objectDetector) {
            const results = objectDetector.detectForVideo(videoElement, now);
            state.objects = results.detections.map(d => ({ category: d.categories[0].categoryName, score: d.categories[0].score }));

            const isDrinking = state.objects.some(obj =>
                (obj.category === 'bottle' || obj.category === 'cup') && obj.score > 0.4
            );
            if (isDrinking) hydrationCounter++; else hydrationCounter = Math.max(0, hydrationCounter - 1);
            state.isHydrating = hydrationCounter >= 2;
        }

        // 3. Fall Detection
        if (poseLandmarker) {
            const results = poseLandmarker.detectForVideo(videoElement, now);
            if (results.landmarks?.length > 0) {
                const lm = results.landmarks[0];
                const torsoY = (lm[11].y + lm[12].y + lm[23].y + lm[24].y) / 4;
                if (lastTorsoY !== null && torsoY - lastTorsoY > 0.05) fallCounter++;
                else fallCounter = Math.max(0, fallCounter - 1);
                state.isFalling = fallCounter > 3;
                lastTorsoY = torsoY;
            }
        }

        // Log to SharedData
        if (window.SharedData) {
            window.SharedData.logMood('self', state.emotion, state.confidence);
        }

        return state;
    }

    window.AuroraVision = {
        init,
        analyze,
        getState: () => state
    };

})();
