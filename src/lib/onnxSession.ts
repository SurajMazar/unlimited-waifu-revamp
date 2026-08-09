import * as ort from 'onnxruntime-web';

class OnnxSessionCache {
  private sessions: Record<string, ort.InferenceSession> = {};

  async get_session(onnx_path: string): Promise<ort.InferenceSession | null> {
    if (!(onnx_path in this.sessions)) {
      try {
        this.sessions[onnx_path] = await ort.InferenceSession.create(onnx_path, {
          executionProviders: ['wasm'],
        });
      } catch (error) {
        console.error(error);
        return null;
      }
    }
    return this.sessions[onnx_path];
  }

  clear() {
    this.sessions = {};
  }
}

export const onnxSession = new OnnxSessionCache();
