import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AudioRecorderService {
  private mediaRecorder!: MediaRecorder;
  private audioChunks: Blob[] = [];
  private audioContext!: AudioContext;
  private stream!: MediaStream;
  private analyser!: AnalyserNode;
  private source!: MediaStreamAudioSourceNode;

  private silenceThreshold = 0.01; // Sensibilidad del silencio
  private silenceDuration = 1800; // ms de silencio antes de parar
  private maxRecordingTime = 15000; // Duración máxima total

  /**
   * Grabación manual sin auto-parada
   */
  async startRecording(): Promise<void> {
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.mediaRecorder = new MediaRecorder(this.stream);
    this.audioChunks = [];

    this.mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) this.audioChunks.push(e.data);
    };

    this.mediaRecorder.start();
  }

  /**
   * Detener grabación manual
   */
  async stopRecording(): Promise<Blob> {
    return new Promise((resolve) => {
      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        resolve(audioBlob);
      };
      this.mediaRecorder.stop();
      this.stream.getTracks().forEach((track) => track.stop());
    });
  }

  /**
   * Grabación automática hasta detectar silencio
   */
  async recordUntilSilence(): Promise<Blob | null> {
    this.audioContext = new AudioContext();
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.source = this.audioContext.createMediaStreamSource(this.stream);
    this.analyser = this.audioContext.createAnalyser();
    this.source.connect(this.analyser);

    this.audioChunks = [];
    this.mediaRecorder = new MediaRecorder(this.stream);
    this.mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) this.audioChunks.push(e.data);
    };

    let spoke = false;
    let spokeAt = Date.now();
    const startTime = Date.now();
    let silenceStart: number | null = null;

    return new Promise((resolve) => {
      const stop = () => {
        this.mediaRecorder.stop();
        this.audioContext.close();
        this.stream.getTracks().forEach((track) => track.stop());

        this.mediaRecorder.onstop = () => {
          if (!spoke) {
            resolve(null); // No se habló nada útil
          } else {
            const blob = new Blob(this.audioChunks, { type: 'audio/webm' });
            resolve(blob);
          }
        };
      };

      const checkSilence = () => {
        const now = Date.now();

        const dataArray = new Uint8Array(this.analyser.fftSize);
        this.analyser.getByteTimeDomainData(dataArray);
        const volume = this.calculateVolume(dataArray);

        if (volume >= this.silenceThreshold) {
          spoke = true;
          spokeAt = now;
          silenceStart = null;
        } else {
          if (silenceStart === null) silenceStart = now;
          if (now - silenceStart > this.silenceDuration) return stop();
        }

        if (now - spokeAt > 5000) return stop(); // 💤 más de 5s sin hablar
        if (now - startTime > this.maxRecordingTime) return stop();

        requestAnimationFrame(checkSilence);
      };

      setTimeout(() => {
        this.mediaRecorder.start();
        requestAnimationFrame(checkSilence);
      }, 300);
    });
  }

  /**
   * Cálculo de volumen para detectar voz vs silencio
   */
  private calculateVolume(data: Uint8Array): number {
    const rms =
      Math.sqrt(
        data.reduce((sum, val) => sum + (val - 128) ** 2, 0) / data.length
      ) / 128;
    return rms;
  }
}
