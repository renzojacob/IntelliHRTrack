import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { attendanceService } from '../../services/attendance.service'
import { useAuthStore } from '../../store/authStore'
import { ClockIcon, CameraIcon } from '@heroicons/react/24/outline'

export default function Attendance() {
  const { user } = useAuthStore()
  const employeeId = user?.employee?.id
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const queryClient = useQueryClient()

  const { data: todayAttendance } = useQuery(
    'today-attendance',
    () => attendanceService.getTodayAttendance(),
    { enabled: !!employeeId, refetchInterval: 5000 }
  )

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
      })
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        setStream(mediaStream)
      }
    } catch (error) {
      console.error('Error accessing camera:', error)
      alert('Could not access camera. Please check permissions.')
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }

  const captureFrame = (): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      if (!videoRef.current || !canvasRef.current) {
        reject(new Error('Video or canvas not available'))
        return
      }

      const video = videoRef.current
      const canvas = canvasRef.current
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Could not get canvas context'))
        return
      }

      ctx.drawImage(video, 0, 0)
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error('Failed to capture frame'))
        }
      }, 'image/jpeg', 0.95)
    })
  }

  const checkInMutation = useMutation(
    async () => {
      if (!employeeId) throw new Error('Employee ID not found')
      
      let imageFile: File | undefined
      if (stream) {
        const blob = await captureFrame()
        imageFile = new File([blob], 'face.jpg', { type: 'image/jpeg' })
      }

      // Get geolocation
      let locationLat: number | undefined
      let locationLng: number | undefined
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject)
        })
        locationLat = position.coords.latitude
        locationLng = position.coords.longitude
      } catch (error) {
        console.error('Geolocation error:', error)
      }

      return attendanceService.checkIn(
        {
          employee_id: employeeId,
          method: 'face',
          location_lat: locationLat,
          location_lng: locationLng,
        },
        imageFile
      )
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('today-attendance')
        stopCamera()
      },
    }
  )

  const checkOutMutation = useMutation(
    async () => {
      if (!employeeId) throw new Error('Employee ID not found')
      
      let imageFile: File | undefined
      if (stream) {
        const blob = await captureFrame()
        imageFile = new File([blob], 'face.jpg', { type: 'image/jpeg' })
      }

      return attendanceService.checkOut(
        {
          employee_id: employeeId,
          attendance_id: todayAttendance?.attendance?.id,
        },
        imageFile
      )
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('today-attendance')
        stopCamera()
      },
    }
  )

  const handleCheckIn = async () => {
    if (!stream) {
      await startCamera()
      return
    }
    checkInMutation.mutate()
  }

  const handleCheckOut = async () => {
    if (!stream) {
      await startCamera()
      return
    }
    checkOutMutation.mutate()
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Attendance</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-card">
          <h2 className="text-xl font-semibold mb-4">Check In/Out</h2>
          
          {stream && (
            <div className="mb-4">
              <div className="relative w-full max-w-md mx-auto">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full rounded-lg"
                />
                <canvas ref={canvasRef} className="hidden" />
              </div>
            </div>
          )}

          <div className="space-y-4">
            {!todayAttendance?.checked_in ? (
              <button
                onClick={handleCheckIn}
                disabled={checkInMutation.isLoading}
                className="btn-primary w-full flex items-center justify-center"
              >
                <CameraIcon className="w-5 h-5 mr-2" />
                {stream ? 'Check In' : 'Start Camera & Check In'}
              </button>
            ) : !todayAttendance.checked_out ? (
              <button
                onClick={handleCheckOut}
                disabled={checkOutMutation.isLoading}
                className="btn-primary w-full flex items-center justify-center"
              >
                <ClockIcon className="w-5 h-5 mr-2" />
                {stream ? 'Check Out' : 'Start Camera & Check Out'}
              </button>
            ) : (
              <div className="text-center py-4">
                <p className="text-green-600 font-semibold">Already checked out for today</p>
              </div>
            )}

            {stream && (
              <button onClick={stopCamera} className="btn-secondary w-full">
                Stop Camera
              </button>
            )}
          </div>
        </div>

        <div className="glass-card">
          <h2 className="text-xl font-semibold mb-4">Today's Status</h2>
          {todayAttendance?.checked_in ? (
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Check-in:</span>
                <span className="font-semibold">
                  {new Date(todayAttendance.attendance.check_in_time).toLocaleTimeString()}
                </span>
              </div>
              {todayAttendance.checked_out && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Check-out:</span>
                  <span className="font-semibold">
                    {new Date(todayAttendance.attendance.check_out_time).toLocaleTimeString()}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Status:</span>
                <span className={`font-semibold ${
                  todayAttendance.attendance.status === 'late' ? 'text-red-600' : 'text-green-600'
                }`}>
                  {todayAttendance.attendance.status || 'On Time'}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-400">Not checked in yet</p>
          )}
        </div>
      </div>
    </div>
  )
}













