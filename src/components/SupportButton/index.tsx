import React, { ButtonHTMLAttributes, useEffect, useState } from 'react'
import styled from 'styled-components'

const showMessageBackgroundColor = '#1568E5'
const smallButtonBackgroundColor = '#FD3944'

const StyledButton = styled.button<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    showMessage?: boolean
    moveUp: boolean
  }
>`
  position: fixed;
  bottom: ${({ moveUp }) => (moveUp ? '80px' : '20px')};
  right: 20px;
  display: flex;
  align-items: center;
  justify-content: space-around;
  text-align: center;
  font-size: ${({ showMessage }) => (showMessage ? '18px' : '14px')};
  border-style: none;
  background-color: ${({ showMessage }) =>
    showMessage ? showMessageBackgroundColor : smallButtonBackgroundColor};
  color: white;
  border-radius: ${({ showMessage }) => (showMessage ? '25px' : '50%')};
  min-width: ${({ showMessage }) => (showMessage ? '140px' : '25px')};
  height: ${({ showMessage }) => (showMessage ? '70px' : '25px')};
  transition: all 0.05s ease-in;

  &::before {
    content: '';
    position: absolute;
    top: 85%;
    right: -3%;
    margin-top: -8px;
    border-style: solid;
    border-width: 14px 0 0 24px;
    border-color: transparent transparent transparent
      ${({ showMessage }) =>
        showMessage ? showMessageBackgroundColor : smallButtonBackgroundColor};
    visibility: ${({ showMessage }) => (showMessage ? 'visible' : 'hidden')};
  }
`

export function SupportButton() {
  const [state, setState] = useState(false)
  const [moveUp, setMoveUp] = useState(false)
  useEffect(function mount() {
    setMoveUp(window.innerWidth < 640)
  })

  const handleClick = () => {
    if (state) {
      const newWindow = window.open('https://t.me/mxcchatgpt_bot')
      if (newWindow) newWindow.opener = null
      setState(false)
    } else {
      setState(true)
    }
  }

  return (
    <StyledButton moveUp={moveUp} showMessage={state} onClick={handleClick}>
      <span>{state ? 'Need help ?' : '1'}</span>
    </StyledButton>
  )
}
