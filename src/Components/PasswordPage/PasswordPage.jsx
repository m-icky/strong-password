import React, { useState } from "react";
import { InputText } from "primereact/inputtext";
import { ProgressBar } from "primereact/progressbar";
import Confetti from 'react-confetti'
import { useWindowSize } from 'react-use';
import "./PasswordPage.css";

const PasswordPage = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [strength, setStrength] = useState(0);
    const [label, setLabel] = useState('');
    const [touched, setTouched] = useState(false);
    const { width, height } = useWindowSize();
    const [isPasswordValid, setIsPasswordValid] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const hasSequential = (str) => {
        const sequences = 'abcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < sequences.length - 2; i++) {
            const seq = sequences.substring(i, i + 3);
            if (str.toLowerCase().includes(seq)) return true;
        }
        return false;
    };

    const isYearLike = (str) => /\b(19\d{2}|20\d{2}|210\d)\b/.test(str);
    const hasRepeats = (str) => /(.)\1{2,}/.test(str);
    const hasKeyboardPattern = (str) =>
        /(qwerty|asdf|zxcv|1qaz|2wsx|password|passw0rd|admin|welcome|iloveyou|letmein)/i.test(str);
    const hasLeetSubstitutions = (str) =>
        /(p@ssw0rd|1oveu|4dm1n|w3lc0m3)/i.test(str);

    const estimateEntropy = (pwd) => {
        const uniqueChars = new Set(pwd).size;
        return Math.round(pwd.length * Math.log2(uniqueChars || 1));
    };

    const evaluatePassword = (pwd) => {
        let score = 0;

        const lengthValid = pwd.length >= 20;
        const hasUpper = /[A-Z]/.test(pwd);
        const hasLower = /[a-z]/.test(pwd);
        const hasNumber = /\d/.test(pwd);
        const hasSpecial = /[\W_]/.test(pwd);
        const noRepeat = !hasRepeats(pwd);
        const noSeq = !hasSequential(pwd);
        const noYear = !isYearLike(pwd);
        const noCommon = !hasKeyboardPattern(pwd);
        const noLeet = !hasLeetSubstitutions(pwd);
        const highEntropy = estimateEntropy(pwd) >= 80;

        if (lengthValid) score += 25;
        if (hasUpper) score += 10;
        if (hasLower) score += 10;
        if (hasNumber) score += 10;
        if (hasSpecial) score += 10;
        if (noRepeat) score += 10;
        if (noSeq) score += 5;
        if (noYear) score += 5;
        if (noCommon && noLeet) score += 10;
        if (highEntropy) score += 15;

        return Math.min(score, 100);
    };

    const getStrengthLabel = (score) => {
        const isMaxSecure = score === 100;
        if (score < 30) return "Very Weak";
        if (score < 50) return "Weak";
        if (score < 75) return "Fair";
        if (score < 90) return "Good";
        return isMaxSecure ? "Ultra Strong" : "Almost Strong";
    };

    const handlePasswordChange = (e) => {
        const newPwd = e.target.value;
        setPassword(newPwd);
        const score = evaluatePassword(newPwd);
        setStrength(score);
        setLabel(getStrengthLabel(score));
        setIsPasswordValid(false);
        setSubmitted(false);
    };

    const handleConfirmPasswordChange = (e) => {
        setConfirmPassword(e.target.value);
        setTouched(true);
        setIsPasswordValid(false);
        setSubmitted(false);
    };

    const getProgressBarColor = (score) => {
        if (score < 40) return 'red';
        if (score < 80) return 'orange';
        return 'green';
    };   
    
    const handleCheckPassword = () => {
        setSubmitted(true);
        if (password && confirmPassword && password === confirmPassword) {
            setIsPasswordValid(true);
        } else {
            setIsPasswordValid(false);
        }
    };    

    const passwordsMatch = password && confirmPassword && password === confirmPassword;

    return (
        <div className="password-container" style={{ width: '400px', margin: '2rem auto' }}>
            {(passwordsMatch && isPasswordValid) && <Confetti width={width} height={height} />}
            <h2>Military-Grade Password Checker</h2>
            <div className="input-group">
                <div className="input-field">
                    <label htmlFor="password">Password</label>
                    <InputText
                        id="password"
                        type="password"
                        value={password}
                        autoComplete="off"
                        onChange={handlePasswordChange}
                        onPaste={(e) => e.preventDefault()}
                        onCopy={(e) => e.preventDefault()}
                        onCut={(e) => e.preventDefault()}
                    />
                </div>

                <div className="input-field">
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <InputText
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        autoComplete="off"
                        onChange={handleConfirmPasswordChange}
                        onPaste={(e) => e.preventDefault()}
                        onCopy={(e) => e.preventDefault()}
                        onCut={(e) => e.preventDefault()}
                    />
                </div>
                <button onClick={handleCheckPassword} className="check-password-button">
                    <span className="p-button-label">Check Password</span>
                </button>
                {submitted && confirmPassword && !passwordsMatch && (
                    <p className="password-not-match">Passwords do not match</p>
                )}
            </div>

            {password && (
                <>
                    <div className="progress-bar-container">
                    <ProgressBar
                        value={strength}
                        style={{ backgroundColor: '#eee' }}
                        className="custom-progress-bar"
                        color={getProgressBarColor(strength)}
                    />
                    </div>
                    <div style={{ marginTop: '0.5rem', textAlign: 'right', fontWeight: 'bold' }}>
                        {label}
                    </div>
                </>
            )}
        </div>
    );
};

export default PasswordPage;
