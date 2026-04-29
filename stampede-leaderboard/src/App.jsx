import React, { useState, useEffect } from 'react'
import Leaderboard from './Leaderboard'
import Admin from './Admin'

export default function App() {
  const isAdmin = window.location.pathname === '/admin'
  return isAdmin ? <Admin /> : <Leaderboard />
}
