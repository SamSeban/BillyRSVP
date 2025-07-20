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

  const [rsvpStatus, setRsvpStatus] = useState<'pending' | 'Oui' | 'Non'>('pending')
  const [guestName, setGuestName] = useState('')
  const [numberOfPeople, setNumberOfPeople] = useState(1)
  const [willComeToParty, setWillComeToParty] = useState(false)
  const [willComeToSynagogue, setWillComeToSynagogue] = useState(false)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  useEffect(() => {
    // Load the Lottie animation data
    fetch('./cocacola.json')
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

  const handleRSVP = async (response: 'Oui' | 'Non') => {
    if (!guestName.trim()) return;
    
    setIsSubmitting(true);
    setSubmitError('');
    
    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyhW-w4FcC6I1az6AKVFwPiJJgQWv0LCLxoxhol7uP_h_ugpLwnWQF6Hi21HH659Lhk/exec';
    
    try {
      console.log('Submitting RSVP with data:', {
        name: guestName.trim(),
        numberOfPeople,
        response,
        willComeToSynagogue,
        willComeToParty,
        comment: comment.trim()
      });
      
      // Use FormData for better compatibility with Google Apps Script
      const formBody = new URLSearchParams();
      formBody.append('name', guestName.trim());
      formBody.append('numberOfPeople', numberOfPeople.toString());
      formBody.append('response', response);
      formBody.append('willComeToSynagogue', willComeToSynagogue.toString());
      formBody.append('willComeToParty', willComeToParty.toString());
      formBody.append('comment', comment.trim());
      
      console.log('Form data being sent:', formBody.toString());
      
      const scriptResponse = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formBody
      });
      
      console.log('Response status:', scriptResponse.status);
      console.log('Response ok:', scriptResponse.ok);
      
      if (scriptResponse.ok) {
        try {
          const result = await scriptResponse.text();
          console.log('Response text:', result);
          
          // Try to parse as JSON, but don't fail if it's not JSON
          try {
            const jsonResult = JSON.parse(result);
            console.log('Parsed JSON:', jsonResult);
            
            if (jsonResult.status === 'error') {
              throw new Error(jsonResult.message);
            }
          } catch (parseError) {
            console.log('Response is not JSON, assuming success', parseError);
          }
          
          setRsvpStatus(response);
          console.log('RSVP submitted successfully!');
        } catch (textError) {
          console.error('Error reading response:', textError);
          // Even if we can't read the response, the request might have succeeded
          setRsvpStatus(response);
        }
      } else {
        throw new Error(`HTTP Error: ${scriptResponse.status}`);
      }
      
    } catch (error) {
      console.error('Detailed error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Une erreur inconnue est survenue';
      setSubmitError(`Erreur de soumission: ${errorMessage}. Veuillez réessayer.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setRsvpStatus('pending')
    setGuestName('')
    setNumberOfPeople(1)
    setWillComeToParty(false)
    setWillComeToSynagogue(false)
    setComment('')
    setSubmitError('')
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
    <div className="min-h-screen min-h-dvh flex flex-col items-center justify-center px-4 text-white bg-gradient-to-b from-red-500 to-red-700">
      {/* Billy Background Pattern */}
      <BillyBackground />
      
      {/* Billy Logo */}
      <div className="absolute top-3 right-3">
        <span className="text-white font-bold text-lg">בס&quot;ד</span>
      </div>

      <div className="mt-25 mb-20 text-center">
        <img 
          src="./logo3.png" 
          alt="Billy" 
          className="w-80 md:w-96 mx-auto drop-shadow-2xl"
        />
      </div>

      {/* Event Details */}
      <div className="p-6 mx-4 max-w-lg mb-8 z-1 bg-[#fbf7ea] rounded-4xl border-4 border-[#f9b64a]">
        <img src="./sectionlogo.png" alt="Billy" className="w-80 md:w-96 mb-8 mx-auto drop-shadow-2xl" />
        <div className="space-y-4 text-[#E60026]">
          <div className="text-center space-y-2">
            <p className="text-lg leading-relaxed">
              C&apos;est avec une immense joie et beaucoup d&apos;émotion<br />
              que nous vous annonçons la<br />
              <span className="font-bold text-xl">Bar Mitzvah de notre cher Billy Moïse</span>
            </p>
            
            <div className="mt-6 space-y-4">
              <div className="bg-white/50 rounded-2xl p-4 border-2 border-[#f9b64a]">
                <p className="font-semibold text-lg">📿 Mise des Téfilines</p>
                <p>Jeudi 1er janvier 2026</p>
                <p className="text-sm italic">(plus d&apos;infos à venir)</p>
              </div>
              
              <div className="bg-white/50 rounded-2xl p-4 border-2 border-[#f9b64a]">
                <p className="font-semibold text-lg">🎉 La célébration</p>
                <p>Dimanche 4 janvier 2026</p>
              </div>
            </div>
            
            <div className="mt-6 space-y-2">
              <p>Votre présence est une évidence pour nous,<br />
                et nous serions honorés de partager ce moment unique à vos côtés.</p>
              
              <p className="text-lg font-medium">✨ Plus de détails & dress code à venir ✨</p>
              
              <div className="mt-4">
                <p className="italic">Avec tout notre amour,</p>
                <p className="font-bold">The fabulous & fresh family</p>
                <p className="text-lg">Seban · Ayache · Benisti</p>
              </div>
            </div>
          </div>



          
          {/* <div className="transform rotate-[1.5deg] hover:rotate-[0deg] transition-all duration-300 bg-[#fbf7ea] rounded-full p-4 border-4 border-[#f9b64a]">
            <div className="flex items-center gap-3">


            <div className="bottle-cap-icon w-12 h-12">
          <div className="bottle-cap-inner-icon w-12 h-12">
          <svg fill="#ffffff" className="w-5 h-5 text-white" viewBox="0 0 50 50" version="1.2" baseProfile="tiny" xmlns="http://www.w3.org/2000/svg" overflow="inherit"><path d="M25 1l7.082 12.106 13.918.003-6.958 11.89 6.958 11.894-13.916.002-7.084 12.105-7.083-12.105-13.917-.002 6.958-11.894-6.958-11.89 13.918-.003 7.082-12.106zm-9.078 24.01l4.489 7.99h9.165l4.501-7.99-4.5-8.01h-9.151l-4.504 8.01zm18.617 7.99h4.041l-2.019-3.453-2.022 3.453zm-23.122 0h4.042l-2.022-3.454-2.02 3.454zm11.574-20h4.042l-2.021-3.452-2.021 3.452zm13.57 7.451l2.019-3.451h-4.041l2.022 3.451zm-23.124.002l2.021-3.453h-4.042l2.021 3.453zm11.575 19.997l2.021-3.45h-4.043l2.022 3.45z"/></svg>    
          </div>
        </div>

              <div>
                <div className="tracking-tight font-bold text-[#E60026] text-xl">Jeudi 1er janvier</div>
                <div className="text-[#E60026] text-lg tracking-tight">Mise des téfilines</div>
              </div>
            </div>
          </div>
          <div className="transform -rotate-[1deg] hover:rotate-[0deg] transition-all duration-300 bg-[#fbf7ea] rounded-full p-4 border-4 border-[#f9b64a]">
            <div className="flex items-center gap-3">
            <div className="bottle-cap-icon w-12 h-12">
            <div className="bottle-cap-inner-icon w-12 h-12">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
    <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="Party">
            <rect id="Rectangle" fill-rule="nonzero" x="0" y="0" width="24" height="24">

</rect>
            <path d="M4.05024,19.9498 C4.75734,20.6569 5.46444989,20.6569 6.52511,20.3033 L16.9745,14.9203 C17.5768,14.61 17.7027,13.8033 17.2237,13.3242 L10.6758,6.77632 C10.1967,6.29726 9.38998,6.42319 9.07971,7.02547 L3.69668,17.4749 C3.34313,18.5355 3.34313,19.2426 4.05024,19.9498 Z" id="Path" stroke="white" stroke-width="2" stroke-linecap="round">

</path>
            <path d="M18,6 L19.3675,5.31623 C19.6787,5.16066 19.746,4.74598 19.5,4.5 L19.5,4.5 C19.254,4.25402 19.3213,3.83934 19.6325,3.68377 L21,3" id="Path" stroke="white" stroke-width="2" stroke-linecap="round">

</path>
            <line x1="16" y1="8" x2="16.125" y2="8" id="Path" stroke="white" stroke-width="2" stroke-linecap="round">

</line>
            <line x1="19.375" y1="11.5" x2="19.5" y2="11.5" id="Path" stroke="white" stroke-width="2" stroke-linecap="round">

</line>
            <line x1="12" y1="4" x2="11" y2="2.5" id="Path" stroke="white" stroke-width="2" stroke-linecap="round">

</line>
            <line x1="15.5" y1="4.5" x2="16" y2="2" id="Path" stroke="white" stroke-width="2" stroke-linecap="round">

</line>
            <line x1="22" y1="9" x2="19.5" y2="8.5" id="Path" stroke="white" stroke-width="2" stroke-linecap="round">

</line>
            <line x1="12" y1="8.5" x2="12" y2="17.5" id="Path" stroke="white" stroke-width="2" stroke-linecap="round">

</line>
            <line x1="8" y1="9.5" x2="8" y2="19.5" id="Path" stroke="white" stroke-width="2" stroke-linecap="round">

</line>
        </g>
    </g>
</svg>
              </div>
            </div>
              <div>
                <div className="tracking-tight font-bold text-[#E60026] text-xl">Dimanche 4 janvier</div>
                <div className="text-[#E60026] text-lg tracking-tight">La célébration</div>
              </div>
            </div>
          </div> */}
        </div>
      </div>

      {/* Countdown Timer */}
      <div className="transform rotate-[1.5deg] hover:rotate-[0deg] transition-all duration-300 bg-[#fbf7ea] rounded-4xl border-4 border-[#f9b64a] z-1 p-4 grid grid-cols-3 gap-2 sm:gap-4 md:gap-6 mb-16 justify-items-center">
        <div className="bottle-cap">
          <div className="bottle-cap-inner">
            <div className="text-2xl md:text-3xl font-extrabold text-white">{timeLeft.days}</div>
            <div className="text-sm text-white font-bold">Jours</div>
          </div>
        </div>
        <div className="bottle-cap">
          <div className="bottle-cap-inner">
            <div className="text-2xl md:text-3xl font-extrabold text-white">{timeLeft.hours}</div>    
            <div className="text-sm text-white font-bold">Heures</div>
          </div>
        </div>
        <div className="bottle-cap">
          <div className="bottle-cap-inner">
            <div className="text-2xl md:text-3xl font-extrabold text-white">{timeLeft.minutes}</div>
            <div className="text-sm text-white font-bold">Minutes</div>
          </div>
        </div>
        {/* <div className="bottle-cap">
          <div className="bottle-cap-inner">
            <div className="text-2xl md:text-3xl font-bold text-white">{timeLeft.seconds}</div>
            <div className="text-sm text-white font-medium">Secondes</div>
          </div>
        </div> */}
      </div>

      <style jsx>{`
        .bottle-cap {
          width: 100px;
          height: 100px;
          background-image: url('./bottlecap.svg');
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


        .bottle-cap-icon {
          background-image: url('./bottlecap.svg');
          background-size: contain;
          background-repeat: no-repeat;
          background-position: center;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          // filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.3));
        }
        
        .bottle-cap-inner-icon {
          position: relative;
          z-index: 2;
          text-align: center;
          border-radius: 50%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }


      `}</style>

      {/* RSVP Section */}
      <div className="bg-white rounded-4xl p-8 w-full max-w-lg mb-10 shadow-2xl border-4 border-[#E60026] z-1">
        {rsvpStatus === 'pending' ? (
          <>
            <h2 className="text-center text-2xl font-bold text-[#E60026] mb-6">
              Confirmez votre présence
            </h2>
            
            {/* Name Input */}
            <div className="mb-6">
              <label className="block text-[#E60026] font-semibold mb-2">Nom *</label>
              <input
                type="text"
                placeholder="Votre nom"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="w-full p-4 rounded-full bg-gray-50 border-2 border-[#E60026]/30 text-[#E60026] placeholder-[#E60026]/60 focus:outline-none focus:ring-3 focus:ring-[#E60026]/50 focus:border-[#E60026] transition-all"
              />
            </div>

            {/* Number of People */}
            <div className="mb-6">
              <label className="block text-[#E60026] font-semibold mb-2">Nombre de personnes</label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setNumberOfPeople(Math.max(1, numberOfPeople - 1))}
                  className="w-10 h-10 bg-[#E60026] text-white rounded-full flex items-center justify-center font-bold text-lg hover:bg-[#B8001F] transition-all"
                >
                  -
                </button>
                <div className="flex-1 p-4 rounded-full bg-gray-50 border-2 border-[#E60026]/30 text-[#E60026] text-center font-semibold">
                  {numberOfPeople}
                </div>
                <button
                  type="button"
                  onClick={() => setNumberOfPeople(numberOfPeople + 1)}
                  className="w-10 h-10 bg-[#E60026] text-white rounded-full flex items-center justify-center font-bold text-lg hover:bg-[#B8001F] transition-all"
                >
                  +
                </button>
              </div>
            </div>

            {/* Checkboxes */}
            <div className="mb-6">
              <label className="block text-[#E60026] font-semibold mb-3">Événements</label>
              <div className="space-y-3">

                <label className="flex items-center cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={willComeToSynagogue}
                      onChange={(e) => setWillComeToSynagogue(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`w-6 h-6 rounded border-2 transition-all ${
                      willComeToSynagogue 
                        ? 'bg-[#E60026] border-[#E60026]' 
                        : 'bg-gray-50 border-[#E60026]/30 group-hover:border-[#E60026]'
                    }`}>
                      {willComeToSynagogue && (
                        <svg className="w-4 h-4 text-white absolute top-0.5 left-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="ml-3 text-[#E60026] font-medium">Viendra à la synagogue</span>
                </label>
                <label className="flex items-center cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={willComeToParty}
                      onChange={(e) => setWillComeToParty(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`w-6 h-6 rounded border-2 transition-all ${
                      willComeToParty 
                        ? 'bg-[#E60026] border-[#E60026]' 
                        : 'bg-gray-50 border-[#E60026]/30 group-hover:border-[#E60026]'
                    }`}>
                      {willComeToParty && (
                        <svg className="w-4 h-4 text-white absolute top-0.5 left-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="ml-3 text-[#E60026] font-medium">Viendra à la fête</span>
                </label>
              </div>
            </div>

            {/* Comment */}
            <div className="mb-6">
              <label className="block text-[#E60026] font-semibold mb-2">Commentaire</label>
              <textarea
                placeholder="Message optionnel..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                className="w-full p-4 rounded-xl bg-gray-50 border-2 border-[#E60026]/30 text-[#E60026] placeholder-[#E60026]/60 focus:outline-none focus:ring-3 focus:ring-[#E60026]/50 focus:border-[#E60026] transition-all resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={() => handleRSVP('Non')}
                disabled={!guestName.trim() || isSubmitting}
                className="flex-1 cursor-pointer bg-white hover:bg-gray-100 disabled:bg-gray-200 disabled:cursor-not-allowed text-[#E60026] border-2 border-[#E60026] font-bold py-4 px-6 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                {isSubmitting ? 'Envoi...' : 'Ne peut pas venir'}
              </button>
              <button
                onClick={() => handleRSVP('Oui')}
                disabled={!guestName.trim() || (!willComeToParty && !willComeToSynagogue) || isSubmitting}
                className="flex-1 cursor-pointer bg-[#E60026] hover:bg-[#B8001F] disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg text-nowrap"
              >
                {isSubmitting ? 'Envoi...' : 'Confirmer'}
              </button>
            </div>
            {submitError && (
              <div className="mt-4 text-center text-red-500 text-sm">
                <p className="mb-2">{submitError}</p>
                <button 
                  onClick={() => setSubmitError('')}
                  className="text-[#E60026] underline hover:no-underline"
                >
                  Réessayer
                </button>
              </div>
            )}
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
            
            {rsvpStatus === 'Oui' ? (
              <div className="text-left bg-gray-50 rounded-xl p-4 mb-6">
                <h4 className="font-semibold text-[#E60026] mb-3">Détails de votre RSVP :</h4>
                <div className="space-y-2 text-gray-700">
                  <p><span className="font-medium">Nombre de personnes :</span> {numberOfPeople}</p>
                  {willComeToParty && (
                    <p className="flex items-center">
                      <svg className="w-4 h-4 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Viendra à la fête
                    </p>
                  )}
                  {willComeToSynagogue && (
                    <p className="flex items-center">
                      <svg className="w-4 h-4 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Viendra à la synagogue
                    </p>
                  )}
                  {comment && (
                    <div>
                      <span className="font-medium">Commentaire :</span>
                      <p className="italic mt-1">{comment}</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-lg text-gray-700 mb-6">
                Vous nous manquerez, mais merci de nous avoir prévenu !
              </p>
            )}
            
            <button
              onClick={resetForm}
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