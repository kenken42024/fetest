import { useState, useEffect, useRef } from 'react';
import '../App.css';

function Result({result, maxAttempts, attempts, handleRetry, isBlocked})	 {
    const passedTexts = [
        "CAPTCHA: 0, You: 1. Take that, robots!",
        "You’ve outsmarted the bots... for now.",
        "Congratulations! You’re officially smarter than a machine.",
        "CAPTCHA passed! Robots can’t stop you!",
        "Nice job! You’ve proven your humanity. Now go forth and surf the web.",
        "You passed the test! Time to celebrate with some internet browsing.",
        "Congrats! You can now enter the secret lair... or just continue browsing.",
        "You did it! The robots are jealous of your skills.",
        "Victory is yours! CAPTCHA couldn’t hold you back.",
        "You’ve unlocked the next level: The Internet."
    ];

    const failedTexts = [
        "Beep boop. Looks like you're one of us now!",
        "Nice try, human... or are you?",
        "Robots: 1, You: 0. Try again, fleshbag!",
        "CAPTCHA failed. The robots are laughing.",
        "You almost had it, but the robots outsmarted you.",
        "Bzzzt! Wrong answer. Are you sure you’re not a robot?",
        "Looks like the machines won this round!",
        "Access denied. Even robots have standards!",
        "Computers: 1, Humans: 0. Better luck next time!",
        "Robot uprising averted... for now."
    ];

    const [text, setText] = useState('')

    useEffect(() => {
        console.log(result)
        getRandomText()
    }, [])

    const getRandomText = () => {
        const randomPassedIndex = Math.floor(Math.random() * passedTexts.length);
        const randomFailedIndex = Math.floor(Math.random() * failedTexts.length);
        setText(result ? passedTexts[randomPassedIndex] : failedTexts[randomFailedIndex]);
    }

    const getCookie = (name) => {
		const cookieName = name + "=";
		const decodedCookie = decodeURIComponent(document.cookie);
		const cookieArray = decodedCookie.split(';');
		for (let i = 0; i < cookieArray.length; i++) {
			let cookie = cookieArray[i].trim();
			if (cookie.indexOf(cookieName) === 0) {
				return cookie.substring(cookieName.length, cookie.length);
			}
		}
		return "";
	};

    return (
        <>	
			{   
                isBlocked
                ?   <>
                        <div className='failed-group'>
                            <img className='failed-img' src="https://media.giphy.com/media/S0hxMGYFhEMzm/giphy.gif?cid=ecf05e47y8epjgg52t68rxu6qzye09krz3pmhkidqwjo2j7i&ep=v1_gifs_search&rid=giphy.gif&ct=g" alt="" width={200} height={150}/>
                            <span className='failed-text'>{ `You are blocked! Try again after ${new Date(getCookie('blockUntil')).toLocaleTimeString()}.` }</span>
                        </div>
                    </>
                :   result
                    ?   <>
                            <div className='passed-group'>
                                <img className='passed-img' src="https://media.giphy.com/media/GkoPRrSUXKpuw2Ql7I/giphy.gif?cid=790b76116w4a28q0e0zbweu7f5m47yy5rraq1sco2lwh8dct&ep=v1_gifs_search&rid=giphy.gif&ct=g" alt="" width={100} height={100}/>
                                <span className='passed-text'>{ text }</span>
                            </div>
                        </>
                    :   <>
                            <div className='failed-group'>
                                <img className='failed-img' src="https://media.giphy.com/media/ro2tOPw8ywqJi/giphy.gif?cid=ecf05e47enzdfpqrrrdeeygqrj8hmtopdyyuu7k9dhy4qa3j&ep=v1_gifs_search&rid=giphy.gif&ct=g" alt="" width={200} height={150}/>
                                <span className='failed-text'>{ text }</span>
                            </div>
                            <div className='mb-3'>
                                <button type='button' id="continueButton" onClick={handleRetry}>Try Again</button>
                            </div>
                            <div className='mb-3'>
                                <span style={{color: 'red'}}>{`CAPTCHA failed! Attempt ${attempts}/${maxAttempts}. Try again.`}</span>
                            </div>
                        </>
            }
        </>
    );
}

export default Result;
