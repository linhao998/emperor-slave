import './style.css'
import { createApp } from './app/createApp'
import { renderHome } from './app/screens/HomeScreen'
import { renderGame } from './app/screens/GameScreen'

const host = document.querySelector<HTMLDivElement>('#app')

if (!host) {
  throw new Error('App host element not found')
}

const root = createApp()
host.appendChild(root)

const showHome = (): void => {
  renderHome(root, (target) => {
    if (target === 'start') {
      showGame()
    }
  })
}

const showGame = (): void => {
  renderGame(root, {
    onExitToHome: () => {
      showHome()
    },
  })
}

showHome()
