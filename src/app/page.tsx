'use client'

import { useState, useEffect } from 'react'
import Lottie from 'lottie-react'
import BillyBackground from '../components/BillyBackground'

export default function Home() {
  const [isLoading, setIsLoading] = useState(true)
  const [animationData, setAnimationData] = useState(null)
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  })

  const [rsvpStatus, setRsvpStatus] = useState<'pending' | 'yes' | 'no'>('pending')
  const [guestName, setGuestName] = useState('')

  useEffect(() => {
    // Load the Lottie animation data
    fetch('/cocacola.json')
      .then(response => response.json())
      .then(data => {
        setAnimationData(data)
        // Show loading animation for 3 seconds after it loads
        setTimeout(() => {
          setIsLoading(false)
        }, 5010)
      })
      .catch(error => {
        console.error('Error loading animation:', error)
        // If animation fails to load, just show content after 1 second
        setTimeout(() => {
          setIsLoading(false)
        }, 1000)
      })
  }, [])

  useEffect(() => {
    const targetDate = new Date('2026-01-01T00:00:00')
    
    const updateCountdown = () => {
      const now = new Date()
      const difference = targetDate.getTime() - now.getTime()
      
      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24))
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((difference % (1000 * 60)) / 1000)
        
        setTimeLeft({ days, hours, minutes, seconds })
      }
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)
    
    return () => clearInterval(interval)
  }, [])

  const handleRSVP = (response: 'yes' | 'no') => {
    if (guestName.trim()) {
      setRsvpStatus(response)
    }
  }

  // Loading screen with Lottie animation
  if (isLoading) {
    return (
      <div className="min-h-screen min-h-dvh flex flex-col items-center justify-center px-4 bg-[#e61d2b]">
        <div className="w-60 h-60 md:w-80 md:h-80">
          {animationData && (
            <Lottie 
              animationData={animationData}
              loop={true}
              autoplay={true}
            />
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen min-h-dvh flex flex-col items-center justify-center px-4 text-white">
      {/* Billy Background Pattern */}
      {/* <BillyBackground /> */}
      
      {/* Billy Logo */}
      <div className="mt-10 mb-8 text-center">
        <img 
          src="/logobilly.svg" 
          alt="Billy" 
          className="w-80 md:w-96 mx-auto drop-shadow-2xl"
        />
      </div>

      {/* Event Details */}
      {/* <div className="text-center mb-2">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Bar Mitzvah</h2>
         <p className="text-xl md:text-2xl opacity-90">Rejoignez nous pour une célébration inoubliable !</p> 
      </div> */}

      {/* Countdown Timer */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-6 mb-16 justify-items-center">
        <div className="bottle-cap">
          <div className="bottle-cap-inner">
            <div className="text-2xl md:text-3xl font-bold text-white">{timeLeft.days}</div>
            <div className="text-xs md:text-sm text-white font-medium">Jours</div>
          </div>
        </div>
        <div className="bottle-cap">
          <div className="bottle-cap-inner">
            <div className="text-2xl md:text-3xl font-bold text-white">{timeLeft.hours}</div>    
            <div className="text-xs md:text-sm text-white font-medium">Heures</div>
          </div>
        </div>
        <div className="bottle-cap">
          <div className="bottle-cap-inner">
            <div className="text-2xl md:text-3xl font-bold text-white">{timeLeft.minutes}</div>
            <div className="text-xs md:text-sm text-white font-medium">Minutes</div>
          </div>
        </div>
        {/* <div className="bottle-cap">
          <div className="bottle-cap-inner">
            <div className="text-2xl md:text-3xl font-bold text-white">{timeLeft.seconds}</div>
            <div className="text-xs md:text-sm text-white font-medium">Secondes</div>
          </div>
        </div> */}
      </div>

      <style jsx>{`
        .bottle-cap {
          width: 100px;
          height: 100px;
          background-image: url('/bottlecap.svg');
          background-size: contain;
          background-repeat: no-repeat;
          background-position: center;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          // filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.3));
        }
        
        .bottle-cap-inner {
          position: relative;
          z-index: 2;
          text-align: center;
          width: 70px;
          height: 70px;
          border-radius: 50%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        
        @media (min-width: 768px) {
          .bottle-cap {
            width: 120px;
            height: 120px;
          }
          
          .bottle-cap-inner {
            width: 85px;
            height: 85px;
          }
        }
      `}</style>

      {/* RSVP Section */}
      <div className="bg-white rounded-2xl p-8 w-full max-w-md mb-10 shadow-2xl border-4 border-[#E60026]">
        {rsvpStatus === 'pending' ? (
          <>
            <h2 className="text-center text-2xl font-bold text-[#E60026] mb-6">
              Confirmez votre présence
            </h2>
            <input
              type="text"
              placeholder="Votre nom"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              className="w-full p-4 rounded-full bg-gray-50 border-2 border-[#E60026]/30 text-[#E60026] placeholder-[#E60026]/60 mb-6 focus:outline-none focus:ring-3 focus:ring-[#E60026]/50 focus:border-[#E60026] transition-all"
            />
            <div className="flex gap-4">
              <button
                onClick={() => handleRSVP('yes')}
                disabled={!guestName.trim()}
                className="flex-1 cursor-pointer bg-[#E60026] hover:bg-[#B8001F] disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg text-nowrap"
              >
                Je serai là !
              </button>
              <button
                onClick={() => handleRSVP('no')}
                disabled={!guestName.trim()}
                className="flex-1 cursor-pointer bg-white hover:bg-gray-100 disabled:bg-gray-200 disabled:cursor-not-allowed text-[#E60026] border-2 border-[#E60026] font-bold py-4 px-6 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Je ne peux pas y aller
              </button>
            </div>
          </>
        ) : (
          <div className="text-center">
            <div className="w-16 h-16 bg-[#E60026] rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold mb-4 text-[#E60026]">
              Merci, {guestName} !
            </h3>
            <p className="text-lg text-gray-700 mb-6">
              {rsvpStatus === 'yes' 
                ? "Nous sommes ravis de célébrer avec vous !" 
                : "Vous nous manquerez, mais merci de nous avoir prévenu !"
              }
            </p>
            <button
              onClick={() => {
                setRsvpStatus('pending')
                setGuestName('')
              }}
              className="bg-white hover:bg-gray-100 text-[#E60026] border-2 border-[#E60026] font-bold py-3 px-6 rounded-full transition-all duration-300 transform hover:scale-105 shadow-md"
            >
              Changer de réponse
            </button>
          </div>
        )}
      </div>
    </div>
  )
} 