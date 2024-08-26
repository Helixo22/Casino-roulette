"use client";

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { RouletteWheel } from '@/components/ui/RouletteWheel'

const INITIAL_BALANCE = 500
const NUMBERS = [
  '0', '32', '15', '19', '4', '21', '2', '25', '17', '34', '6', '27', '13', '36',
  '11', '30', '8', '23', '10', '5', '24', '16', '33', '1', '20', '14', '31', '9',
  '22', '18', '29', '7', '28', '12', '35', '3', '26', '00'
]
const RED_NUMBERS = ['1', '3', '5', '7', '9', '12', '14', '16', '18', '19', '21', '23', '25', '27', '30', '32', '34', '36']

type Bets = {
  [key: string]: number;
}

export default function Component() {
  const [balance, setBalance] = useState(INITIAL_BALANCE)
  const [debt, setDebt] = useState(0)
  const [betAmount, setBetAmount] = useState(1)
  const [bets, setBets] = useState<Bets>({})
  const [result, setResult] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [previousResults, setPreviousResults] = useState<string[]>([])
  const [isSpinning, setIsSpinning] = useState(false)

  useEffect(() => {
    const savedState = JSON.parse(localStorage.getItem('rouletteState') || '{}')
    if (savedState.balance) setBalance(savedState.balance)
    if (savedState.debt) setDebt(savedState.debt)
    if (savedState.previousResults) setPreviousResults(savedState.previousResults)
  }, [])

  useEffect(() => {
    localStorage.setItem('rouletteState', JSON.stringify({ balance, debt, previousResults }))
  }, [balance, debt, previousResults])

  const handleBet = (bet: string) => {
    if (bet === 'red' || bet === 'black') {
      if (bets['red'] || bets['black']) {
        setMessage('You can only bet on either red or black, not both.')
        return
      }
      setBets({ ...bets, [bet]: betAmount })
    } else if (bet === '0' || bet === '00') {
      setBets({ ...bets, [bet]: (bets[bet] || 0) + betAmount })
    } else {
      const numberBetsCount = Object.keys(bets).filter(b => !['red', 'black', '0', '00'].includes(b)).length
      if (numberBetsCount >= 9 && !bets[bet]) {
        setMessage('Maximum 9 number bets allowed.')
        return
      }
      setBets({ ...bets, [bet]: (bets[bet] || 0) + betAmount })
    }
  }

  const handleSpin = () => {
    if (Object.keys(bets).length === 0) {
      setMessage('Please place at least one bet.')
      return
    }
    const totalBet = Object.values(bets).reduce((sum, bet) => sum + bet, 0)
    if (totalBet > balance) {
      setMessage('Insufficient balance for this bet.')
      return
    }
    setBalance(prevBalance => prevBalance - totalBet)
    setIsSpinning(true)
    
    setTimeout(() => {
      const randomResult = NUMBERS[Math.floor(Math.random() * NUMBERS.length)]
      setResult(randomResult)
      setIsSpinning(false)
      calculateWinnings(randomResult, totalBet)
      setBets({})  // Reset bets after spin
      setPreviousResults(prev => [randomResult, ...prev].slice(0, 10))
    }, 5000)  // Spin for 5 seconds
  }

  const calculateWinnings = (spinResult: string, totalBet: number) => {
    let winnings = 0
    
    Object.entries(bets).forEach(([bet, amount]) => {
      if (bet === spinResult) {
        winnings += amount * 36
      } else if ((bet === 'red' && RED_NUMBERS.includes(spinResult)) ||
                 (bet === 'black' && !RED_NUMBERS.includes(spinResult) && spinResult !== '0' && spinResult !== '00')) {
        winnings += amount * 2
      }
    })

    if (winnings > 0) {
      if (debt > 0) {
        const debtPayment = Math.min(winnings, debt)
        setDebt(prevDebt => prevDebt - debtPayment)
        winnings -= debtPayment
        setMessage(`You won ${winnings + debtPayment} fish! ${debtPayment} fish was used to pay off your debt.`)
      } else {
        setMessage(`Congratulations! You won ${winnings} fish!`)
      }
      setBalance(prevBalance => prevBalance + winnings)
    } else {
      setMessage(`Sorry, you lost ${totalBet} fish. Try again!`)
    }
  }

  const handleTakeDebt = () => {
    const newDebt = 500
    setDebt(prevDebt => prevDebt + newDebt)
    setBalance(prevBalance => prevBalance + newDebt)
    setMessage(`You took a debt of ${newDebt} fish. Remember to pay it back!`)
  }

  const getResultColor = (result: string) => {
    if (result === '0' || result === '00') return 'text-green-500'
    return RED_NUMBERS.includes(result) ? 'text-red-500' : 'text-gray-900'
  }

  return (
    <div className="container mx-auto p-4 bg-green-900 text-white min-h-screen">
      <h1 className="text-4xl font-bold mb-6 text-center">Roulette by Helixo</h1>
      <div className="flex flex-col md:flex-row justify-between items-start mb-6">
        <div className="mb-4 md:mb-0">
          <p className="text-2xl mb-2">Your Balance: {balance} fish</p>
          {debt > 0 && <p className="text-xl mb-2 text-red-400">Your Debt: {debt} fish</p>}
          <div className="flex items-center mb-4">
            <Input
              type="number"
              value={betAmount}
              onChange={(e) => setBetAmount(Math.max(1, parseInt(e.target.value)))}
              className="w-24 mr-2 text-black"
            />
            <Button onClick={handleSpin} disabled={isSpinning} className="bg-yellow-600 hover:bg-yellow-700">
              {isSpinning ? 'Spinning...' : 'Spin'}
            </Button>
          </div>
          {balance === 0 && debt === 0 && (
            <Button onClick={handleTakeDebt} className="bg-red-600 hover:bg-red-700 mb-4">
              Take 500 Fish Debt
            </Button>
          )}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="bg-green-700 hover:bg-green-800">Game Rules</Button>
            </DialogTrigger>
            <DialogContent className="bg-green-800 text-white">
              <DialogHeader>
                <DialogTitle>Roulette Rules</DialogTitle>
                <DialogDescription>
                  <ul className="list-disc pl-5">
                    <li>Place your bets on numbers, red, black, or zeros.</li>
                    <li>You can bet on up to 9 different numbers.</li>
                    <li>You can bet on either red or black, but not both.</li>
                    <li>Zeros (0 and 00) can be bet on separately.</li>
                    <li>Winning bets on a single number pay 35 to 1.</li>
                    <li>Bets on Red or Black pay 1 to 1.</li>
                    <li>If you run out of fish, you can take a 500 fish debt.</li>
                    <li>When you win, your debt will be paid off first before adding to your balance.</li>
                    <li>The game saves your balance, debt, and previous results automatically.</li>
                  </ul>
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </div>
        <div className="w-full md:w-[300px] h-[300px] relative">
          <RouletteWheel spinning={isSpinning} result={result} />
        </div>
      </div>
      <div className="mb-6">
        <h2 className="text-2xl mb-2">Betting Table</h2>
        <div className="grid grid-cols-6 gap-2 mb-4">
          {NUMBERS.map((number) => (
            <Button
              key={number}
              onClick={() => handleBet(number)}
              variant={bets[number] ? "default" : "outline"}
              className={`text-2xl font-bold ${
                RED_NUMBERS.includes(number) ? 'bg-red-600 hover:bg-red-700' : 
                (number === '0' || number === '00') ? 'bg-green-600 hover:bg-green-700' : 
                'bg-black hover:bg-gray-800'
              }`}
            >
              {number}
              {bets[number] && <span className="absolute top-0 right-0 text-xs bg-yellow-400 text-black rounded-full w-5 h-5 flex items-center justify-center">{bets[number]}</span>}
            </Button>
          ))}
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={() => handleBet('red')}
            variant={bets['red'] ? "default" : "outline"}
            className="bg-red-600 hover:bg-red-700 text-2xl font-bold flex-1"
          >
            Red
            {bets['red'] && <span className="absolute top-0 right-0 text-xs bg-yellow-400 text-black rounded-full w-5 h-5 flex items-center justify-center">{bets['red']}</span>}
          </Button>
          <Button
            onClick={() => handleBet('black')}
            variant={bets['black'] ? "default" : "outline"}
            className="bg-black hover:bg-gray-800 text-2xl font-bold flex-1"
          >
            Black
            {bets['black'] && <span className="absolute top-0 right-0 text-xs bg-yellow-400 text-black rounded-full w-5 h-5 flex items-center justify-center">{bets['black']}</span>}
          </Button>
        </div>
      </div>
      {result && (
        <div className="text-center mb-4">
          <p className="text-xl">
            Result: <span className={`font-bold ${getResultColor(result)}`}>{result}</span>
          </p>
          <p className="text-xl">{message}</p>
        </div>
      )}
      <div className="mt-6">
        <h3 className="text-xl mb-2">Previous Results</h3>
        <div className="flex space-x-2 overflow-x-auto">
          {previousResults.map((prevResult, index) => (
            <span key={index} className={`text-lg font-bold ${getResultColor(prevResult)} bg-white rounded-full w-8 h-8 flex items-center justify-center`}>
              {prevResult}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}