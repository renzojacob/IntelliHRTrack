/**
 * Face Recognition utilities using face-api.js
 */

declare global {
  interface Window {
    faceapi: any
  }
}

interface FaceDetection {
  detection: any
  descriptor?: Float32Array
}

// Store enrolled faces (in production, this would be in the backend)
const enrolledFaces: Map<string, Float32Array> = new Map()

export async function loadFaceModels(): Promise<boolean> {
  try {
    if (!window.faceapi) {
      console.error('face-api.js not loaded')
      return false
    }

    const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/'
    
    await Promise.all([
      window.faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      window.faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      window.faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
    ])
    
    return true
  } catch (error) {
    console.error('Error loading face models:', error)
    return false
  }
}

export async function detectFace(imageElement: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement): Promise<FaceDetection | null> {
  try {
    if (!window.faceapi) return null

    const detection = await window.faceapi
      .detectSingleFace(imageElement, new window.faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor()

    if (!detection) return null

    return {
      detection,
      descriptor: detection.descriptor
    }
  } catch (error) {
    console.error('Error detecting face:', error)
    return null
  }
}

export async function enrollFace(employeeId: string, imageElement: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement): Promise<{ success: boolean; confidence?: number }> {
  try {
    const faceData = await detectFace(imageElement)
    
    if (!faceData || !faceData.descriptor) {
      return { success: false }
    }

    enrolledFaces.set(employeeId, faceData.descriptor)
    
    return { success: true, confidence: 0.95 }
  } catch (error) {
    console.error('Error enrolling face:', error)
    return { success: false }
  }
}

export async function recognizeFace(imageElement: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement): Promise<{ employeeId: string | null; confidence: number }> {
  try {
    const faceData = await detectFace(imageElement)
    
    if (!faceData || !faceData.descriptor) {
      return { employeeId: null, confidence: 0 }
    }

    let bestMatch: { employeeId: string; confidence: number } | null = null
    const threshold = 0.6 // Similarity threshold

    for (const [employeeId, enrolledDescriptor] of enrolledFaces.entries()) {
      const distance = window.faceapi.euclideanDistance(faceData.descriptor, enrolledDescriptor)
      const confidence = 1 - distance // Convert distance to confidence
      
      if (confidence > threshold && (!bestMatch || confidence > bestMatch.confidence)) {
        bestMatch = { employeeId, confidence }
      }
    }

    return bestMatch || { employeeId: null, confidence: 0 }
  } catch (error) {
    console.error('Error recognizing face:', error)
    return { employeeId: null, confidence: 0 }
  }
}

export function getEnrolledCount(): number {
  return enrolledFaces.size
}

export function clearEnrolledFaces(): void {
  enrolledFaces.clear()
}


