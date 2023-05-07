import styled, { css } from 'styled-components'

import CircleTick from '@app/assets/CircleTick.svg'

const Container = styled.button<{ $active: boolean }>(
  ({ theme, $active }) => css`
    cursor: pointer;
    flex: 0 0 ${theme.space['9']};
    width: ${theme.space['9']};
    height: ${theme.space['9']};
    svg {
      path,
      rect {
        transition: all 0.15s ease-in-out;
        stroke: ${$active ? theme.colors.accent : theme.colors.textTertiary};
        stroke-width: 1px;
      }
    }

    &:hover {
      svg {
        path,
        rect {
          stroke: ${theme.colors.accent};
          stroke-width: 1.5px;
        }
      }
    }
  `,
)

type Props = {
  active?: boolean
  onChange?: (value: boolean) => void
}

export const CheckButton = ({ active = false, onChange }: Props) => {
  return (
    <Container
      type="button"
      $active={active}
      onClick={() => onChange?.(!active)}
      data-testid="check-button"
    >
      <CircleTick />
    </Container>
  )
}
