'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'

export default function Home() {
  // Video states
  const [videoPhase, setVideoPhase] = useState<"intro" | "playing" | "done">("intro")
  const [videoError, setVideoError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const shieldRef = useRef<HTMLDivElement | null>(null)
  const lastTrustedTimeRef = useRef(0)
  const seekingGuardRef = useRef(false)

  const [rsvpStatus, setRsvpStatus] = useState<'pending' | 'submitted'>('pending')
  const [guestName, setGuestName] = useState('')
  const [thursdayAttending, setThursdayAttending] = useState<'Oui' | 'Non' | ''>('')
  const [thursdayNumberOfPeople, setThursdayNumberOfPeople] = useState(1)
  const [partyAttending, setPartyAttending] = useState<'Oui' | 'Non' | ''>('')
  const [partyNumberOfPeople, setPartyNumberOfPeople] = useState(1)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  // Prevent keyboard seeking (space/arrow keys) when playing video
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (videoPhase !== "playing") return;
      const blocked = [
        " ",
        "Spacebar",
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "ArrowDown",
        "Home",
        "End",
      ];
      if (blocked.includes(e.key)) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    window.addEventListener("keydown", handler, { capture: true });
    return () => window.removeEventListener("keydown", handler, { capture: true });
  }, [videoPhase]);

  // Handle video playback when phase changes to "playing"
  useEffect(() => {
    if (videoPhase !== "playing") return;
    
    const playVideo = async () => {
      const v = videoRef.current;
      if (!v) return;

      // Make sure we start unmuted (allowed because it's a user gesture)
      v.muted = false;
      v.volume = 1.0;
      v.playsInline = true; // iOS inline

      try {
        await v.play();
        // Immediately put an invisible shield over the video to block clicks/taps
        shieldRef.current?.focus();
      } catch {
        // If autoplay with sound fails, fall back to showing a hint
        setVideoError("Tap to unmute and play");
        try {
          v.muted = true;
          await v.play();
          // Then attempt to unmute right away
          v.muted = false;
        } catch {
          v.muted = true;
        }
      }
    };

    playVideo();
  }, [videoPhase]);

  const startPlayback = () => {
    setVideoError(null);
    setVideoPhase("playing");
  };

  const onTimeUpdate = () => {
    const v = videoRef.current;
    if (!v) return;
    // Store the last trusted time
    if (!seekingGuardRef.current) {
      lastTrustedTimeRef.current = v.currentTime;
    }
  };

  const onSeeking = () => {
    const v = videoRef.current;
    if (!v) return;
    // If a seek is attempted, snap back to the last trusted time
    const delta = Math.abs(v.currentTime - lastTrustedTimeRef.current);
    if (delta > 0.2) {
      seekingGuardRef.current = true;
      v.currentTime = lastTrustedTimeRef.current;
      setTimeout(() => (seekingGuardRef.current = false), 50);
    }
  };

  const onEnded = () => {
    setVideoPhase("done");
  };

  const handleRSVP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || !thursdayAttending || !partyAttending) return;
    
    setIsSubmitting(true);
    setSubmitError('');
    
    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyCyTTCsifPMbK4fXxkwWpoKwQ6_CY6fyNQ0py93XYZPB9xlWhGtJWLRVFF7wFZtdVz/exec';
    
    try {
      console.log('Submitting RSVP with data:', {
        name: guestName.trim(),
        thursdayAttending,
        thursdayNumberOfPeople: thursdayAttending === 'Oui' ? thursdayNumberOfPeople : 0,
        partyAttending,
        partyNumberOfPeople: partyAttending === 'Oui' ? partyNumberOfPeople : 0,
        comment: comment.trim()
      });
      
      // Use FormData for better compatibility with Google Apps Script
      const formBody = new URLSearchParams();
      formBody.append('name', guestName.trim());
      formBody.append('thursdayAttending', thursdayAttending);
      formBody.append('thursdayNumberOfPeople', thursdayAttending === 'Oui' ? thursdayNumberOfPeople.toString() : '0');
      formBody.append('partyAttending', partyAttending);
      formBody.append('partyNumberOfPeople', partyAttending === 'Oui' ? partyNumberOfPeople.toString() : '0');
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
          
          setRsvpStatus('submitted');
          console.log('RSVP submitted successfully!');
        } catch (textError) {
          console.error('Error reading response:', textError);
          // Even if we can't read the response, the request might have succeeded
          setRsvpStatus('submitted');
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
    setThursdayAttending('')
    setThursdayNumberOfPeople(1)
    setPartyAttending('')
    setPartyNumberOfPeople(1)
    setComment('')
    setSubmitError('')
  }

  return (
    <div className="min-h-screen min-h-dvh text-white bg-[#f8e5c5]">
      {/* Video Intro: Poster with Play Button */}
      {videoPhase === "intro" && (
          <button
            aria-label="Play video"
            onClick={startPlayback}
            className="group relative w-full h-screen overflow-hidden focus:outline-none focus:ring-4 focus:ring-[#E60026]"
          >
            {/* Poster - you'll need to add a poster image */}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-black/10" />
          {/* Custom Play Button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-white/90 backdrop-blur-md shadow-xl ring-1 ring-black/10 transition group-hover:scale-105">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor" className="translate-x-0.5 text-black/90">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
          </div>
        </button>
      )}

      {/* Video Playing */}
      {videoPhase === "playing" && (
        <div className="relative w-full h-[100dvh] overflow-hidden">
          <video
            ref={videoRef}
            src="./video.mp4"
            // poster="/.jpg"
            className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none z-0"
            playsInline
            controls={false}
            preload="auto"
            onTimeUpdate={onTimeUpdate}
            onSeeking={onSeeking}
            onEnded={onEnded}
            onContextMenu={(e) => e.preventDefault()}
          />
          {/* Shield to block interactions */}
          <div
            ref={shieldRef}
            tabIndex={0}
            aria-hidden
            className="absolute inset-0 outline-none pointer-events-none z-10"
            onKeyDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onDoubleClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          />
          {/* Skip button */}
          <button
            onClick={() => setVideoPhase("done")}
            className="fixed bottom-8 right-8 z-50 pointer-events-auto bg-black/70 hover:bg-black/90 text-white font-semibold px-6 py-3 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg backdrop-blur-sm"
          >
            Passer au RSVP
          </button>
          {videoError && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 rounded-full bg-black/70 px-3 py-1 text-xs text-white">
              {videoError}
            </div>
          )}
        </div>
      )}

      {/* RSVP Section - shown after video ends */}
      {videoPhase === "done" && (
        <div className="min-h-screen min-h-dvh flex flex-col items-center justify-center px-4 py-8">
          <div className="bg-[#f8e5c5] p-8 w-full max-w-2xl shadow-2xl text-black rounded-3xl">
        {rsvpStatus === 'pending' ? (
          <form onSubmit={handleRSVP}>
            {/* Logo */}
            <div className="text-center mb-6">
              <div className="relative h-24 w-full mb-4">
                <Image src="logo.png" alt="Logo" fill className="object-contain" />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-center text-3xl font-bold mb-6">BAR MITSVAH BILLY MOÏSE</h1>

            {/* Description */}
            <p className="text-center mb-6 leading-relaxed">
              C&apos;est avec une émotion profonde et une immense joie que je vais revêtir, pour la toute première fois, les Téphillin. Pour accompagner ce moment unique de ma vie, je serai entouré de l&apos;amour infini de mes parents, Stéphane et Agnès, et de la complicité de mes cinq frères et sœurs, et oui, Jonas, Anaïs, Salomé, Sam & Stella.
            </p>
            <p className="text-center font-semibold mb-8">
              Je serai honoré et heureux de partager cet instant avec vous tous !!
            </p>

            {/* Thursday Event Info */}
            <div className="bg-white/50 p-6 rounded-lg mb-6">
              <h2 className="text-xl font-bold text-center mb-3">Jeudi 1er janvier 2026 – 11 Tévet 5786</h2>
              <p className="text-center mb-2"><strong>À 9 heures précises !</strong></p>
              <p className="text-center mb-2">📍 Synagogue de la Roquette – 84 rue de la Roquette, Paris XI<sup>e</sup></p>
              <p className="text-center mb-2">📖 Lors de la lecture de la Paracha Vaye&apos;hi</p>
              <p className="text-center italic mb-1">&quot;D... sera avec vous et vous ramènera vers le pays de vos ancêtres&quot;</p>
              <p className="text-center hebrew mb-2">&quot;וַיְהִי אֱלֹקִים עִמָּכֶם וְהֵשִׁיב אֶתְכֶם אֶל־אֶרֶץ אֲבוֹתֵיכֶם&quot;</p>
              <p className="text-center font-semibold">Un petit-déjeuner suivra l&apos;office</p>
            </div>

            {/* Name Input */}
            <div className="mb-6">
              <label className="block font-semibold mb-2">Nom Prénom *</label>
              <input
                type="text"
                placeholder="Votre nom et prénom"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                required
                className="w-full p-3 rounded-md bg-white border-2 border-black/30 placeholder-black/40 focus:outline-none focus:ring-2 focus:ring-black/50 transition-all"
              />
            </div>

            {/* Thursday Attendance */}
            <div className="mb-6">
              <label className="block font-semibold mb-2">On compte sur vous ? *</label>
              <div className="space-y-2">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="thursdayAttending"
                    value="Oui"
                    checked={thursdayAttending === 'Oui'}
                    onChange={(e) => setThursdayAttending(e.target.value as 'Oui')}
                    required
                    className="mr-3 w-4 h-4"
                  />
                  <span>Oui, je serai là</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="thursdayAttending"
                    value="Non"
                    checked={thursdayAttending === 'Non'}
                    onChange={(e) => setThursdayAttending(e.target.value as 'Non')}
                    className="mr-3 w-4 h-4"
                  />
                  <span>Non je ne suis pas dispo</span>
                </label>
              </div>
            </div>

            {/* Thursday Number of People */}
            {thursdayAttending === 'Oui' && (
              <div className="mb-6">
                <label className="block font-semibold mb-2">Combien serez-vous ? *</label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setThursdayNumberOfPeople(Math.max(1, thursdayNumberOfPeople - 1))}
                    className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center font-bold text-lg hover:bg-gray-800 transition-all"
                  >
                    -
                  </button>
                  <div className="flex-1 p-3 rounded-md bg-white border-2 border-black/30 text-center font-semibold">
                    {thursdayNumberOfPeople}
                  </div>
                  <button
                    type="button"
                    onClick={() => setThursdayNumberOfPeople(thursdayNumberOfPeople + 1)}
                    className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center font-bold text-lg hover:bg-gray-800 transition-all"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Saturday Event Info */}
            <div className="bg-white/50 p-6 rounded-lg mb-6">
              <h2 className="text-xl font-bold text-center mb-3">Samedi 3 janvier 2026 – 13 Tévet 5786</h2>
              <p className="text-center mb-2">📖 Lecture de la Paracha Vaye&apos;hi</p>
              <p className="text-center mb-2">⏰ à partir de 9h30</p>
              <p className="text-center mb-2">📍 Synagogue de la Roquette – 84 rue de la Roquette, Paris XI<sup>e</sup></p>
              <p className="text-center font-semibold">Un Kiddouch suivra l&apos;office</p>
            </div>

            {/* Sunday Party Info */}
            <div className="bg-white/50 p-6 rounded-lg mb-6">
              <h2 className="text-xl font-bold text-center mb-3">Dimanche 4 janvier 2026</h2>
              <p className="text-center text-2xl font-bold mb-2">Billy&apos;s Party</p>
              <p className="text-center mb-2">À partir de 19h30</p>
              <p className="text-center font-bold">Angie</p>
              <p className="text-center">105 Rue du Faubourg Saint-Honoré, Paris VIII<sup>e</sup></p>
            </div>

            {/* Party Attendance */}
            <div className="mb-6">
              <label className="block font-semibold mb-2">On compte toujours sur vous ? *</label>
              <div className="space-y-2">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="partyAttending"
                    value="Oui"
                    checked={partyAttending === 'Oui'}
                    onChange={(e) => setPartyAttending(e.target.value as 'Oui')}
                    required
                    className="mr-3 w-4 h-4"
                  />
                  <span>Oui, avec plaisir</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="partyAttending"
                    value="Non"
                    checked={partyAttending === 'Non'}
                    onChange={(e) => setPartyAttending(e.target.value as 'Non')}
                    className="mr-3 w-4 h-4"
                  />
                  <span>Non, je vais rater ce grand moment !</span>
                </label>
              </div>
            </div>

            {/* Party Number of People */}
            {partyAttending === 'Oui' && (
              <div className="mb-6">
                <label className="block font-semibold mb-2">Combien serez-vous ? *</label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setPartyNumberOfPeople(Math.max(1, partyNumberOfPeople - 1))}
                    className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center font-bold text-lg hover:bg-gray-800 transition-all"
                  >
                    -
                  </button>
                  <div className="flex-1 p-3 rounded-md bg-white border-2 border-black/30 text-center font-semibold">
                    {partyNumberOfPeople}
                  </div>
                  <button
                    type="button"
                    onClick={() => setPartyNumberOfPeople(partyNumberOfPeople + 1)}
                    className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center font-bold text-lg hover:bg-gray-800 transition-all"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Comment */}
            <div className="mb-6">
              <label className="block font-semibold mb-2">Un mot pour Billy ?</label>
              <textarea
                placeholder="Votre message..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                className="w-full p-3 rounded-md bg-white border-2 border-black/30 placeholder-black/40 focus:outline-none focus:ring-2 focus:ring-black/50 transition-all resize-none"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!guestName.trim() || !thursdayAttending || !partyAttending || isSubmitting}
              className="w-full cursor-pointer bg-black hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-md transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              {isSubmitting ? 'Envoi en cours...' : 'Envoyer ma réponse'}
            </button>

            {submitError && (
              <div className="mt-4 text-center text-red-500 text-sm">
                <p className="mb-2">{submitError}</p>
                <button 
                  type="button"
                  onClick={() => setSubmitError('')}
                  className="underline hover:no-underline"
                >
                  Réessayer
                </button>
              </div>
            )}
          </form>
        ) : (
          <div className="text-center">
            <div className="w-16 h-16 bg-black rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold mb-4">
              Merci, {guestName} !
            </h3>
            <p className="text-lg mb-6">
              Votre réponse a bien été enregistrée.
            </p>
            
            <div className="text-left bg-white/50 rounded-lg p-4 mb-6">
              <h4 className="font-semibold mb-3">Récapitulatif :</h4>
              <div className="space-y-2">
                <p><strong>Jeudi 1er janvier :</strong> {thursdayAttending === 'Oui' ? `Oui (${thursdayNumberOfPeople} personne${thursdayNumberOfPeople > 1 ? 's' : ''})` : 'Non'}</p>
                <p><strong>Dimanche 4 janvier (Party) :</strong> {partyAttending === 'Oui' ? `Oui (${partyNumberOfPeople} personne${partyNumberOfPeople > 1 ? 's' : ''})` : 'Non'}</p>
                {comment && (
                  <div>
                    <strong>Message :</strong>
                    <p className="italic mt-1">{comment}</p>
                  </div>
                )}
              </div>
            </div>
            
            <button
              onClick={resetForm}
              className="bg-white hover:bg-gray-100 border-2 border-black font-bold py-3 px-6 rounded-md transition-all duration-300 transform hover:scale-105 shadow-md"
            >
              Modifier ma réponse
            </button>
          </div>
        )}
          </div>
        </div>
      )}
    </div>
  )
} 