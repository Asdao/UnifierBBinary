import { getEmbedding } from './genai';

interface MemoryEntry {
    role: 'user' | 'model' | 'observation';
    text: string;
    embedding: number[];
    timestamp: number;
}

export class VectorStore {
    private static STORAGE_KEY = 'tom_memory_v1';

    static async addMessage(role: 'user' | 'model' | 'observation', text: string) {
        const embedding = await getEmbedding(text);
        if (!embedding) return;

        const entry: MemoryEntry = {
            role,
            text,
            embedding: embedding as number[],
            timestamp: Date.now()
        };

        const memories = this.getMemories();
        memories.push(entry);

        // Keep only top 150 memories (increased slightly to accommodate observations)
        if (memories.length > 150) memories.shift();

        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(memories));
    }

    static async addObservation(text: string) {
        await this.addMessage('observation', text);
    }

    static getMemories(): MemoryEntry[] {
        const saved = localStorage.getItem(this.STORAGE_KEY);
        return saved ? JSON.parse(saved) : [];
    }

    static async findRelevant(query: string, limit: number = 3): Promise<string> {
        const memories = this.getMemories();
        if (memories.length === 0) return "";

        // 1. Get most recent 3 observations for immediate situational awareness
        const recentObservations = memories
            .filter(m => m.role === 'observation')
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, 3)
            .map(m => `[Observation] ${m.text}`);

        // 2. Semantic query for relevant past messages
        const queryEmbeddingRes = await getEmbedding(query);
        if (!queryEmbeddingRes) return recentObservations.join("\n\n");
        const queryEmbedding = queryEmbeddingRes as number[];

        const scored = memories
            .filter(m => m.role !== 'observation') // Don't duplicate observations in semantic search
            .map(m => ({
                text: m.text,
                score: this.cosineSimilarity(queryEmbedding, m.embedding)
            }));

        const results = scored
            .sort((a, b) => b.score - a.score)
            .slice(0, limit)
            .filter(r => r.score > 0.7)
            .map(r => r.text);

        const contextParts = [];
        if (recentObservations.length > 0) {
            contextParts.push("### Current Situational Awareness\n" + recentObservations.join("\n"));
        }
        if (results.length > 0) {
            contextParts.push("### Relevant Past Context\n" + results.join("\n\n"));
        }

        return contextParts.join("\n\n");
    }

    private static cosineSimilarity(a: number[], b: number[]): number {
        let dotProduct = 0;
        let normA = 0;
        let normB = 0;
        for (let i = 0; i < a.length; i++) {
            dotProduct += a[i] * b[i];
            normA += a[i] * a[i];
            normB += b[i] * b[i];
        }
        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }
}
