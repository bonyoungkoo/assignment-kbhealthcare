import { Stack, TextField, Typography } from '@mui/material'
import { useEffect, useState } from 'react'

export function DeleteConfirmContent({
  taskId,
  onValidChange,
}: {
  taskId: string
  onValidChange: (valid: boolean) => void
}) {
  const [text, setText] = useState('')

  useEffect(() => {
    const valid = text === taskId
    onValidChange(valid)
  }, [text, taskId, onValidChange])

  return (
    <Stack spacing={2} useFlexGap sx={{ pt: 0.5 }}>
      <Typography variant="body2" color="text.secondary">
        정말 삭제하시겠습니까? 삭제하려면 아래 입력칸에 <b>{taskId}</b> 를 그대로 입력하세요.
      </Typography>

      <TextField
        label="삭제 확인"
        placeholder={taskId}
        value={text}
        onChange={e => setText(e.target.value)}
        fullWidth
        autoFocus
      />
    </Stack>
  )
}
