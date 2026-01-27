import { useEffect, useMemo } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Box, Button, Card, CardContent, Chip, Divider, Stack, Typography } from '@mui/material'
import { useModal } from '@/app/providers/modal/useModal'
import { deleteTask, getTaskById } from '@/features/task/api/task.api'
import { ApiError } from '@/shared/api/ApiError'
import type { Task } from '@/mocks/db'
import { DeleteConfirmContent } from './DeleteConfirmComponent'

function NotFoundView() {
  return (
    <Box sx={{ p: 2 }}>
      <Card>
        <CardContent>
          <Stack spacing={1}>
            <Typography variant="h5" fontWeight={700}>
              404 Not Found
            </Typography>
            <Typography color="text.secondary">요청한 할 일을 찾을 수 없습니다.</Typography>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  )
}

export default function TaskDetail() {
  const { id } = useParams()
  const taskId = id ?? ''
  const navigate = useNavigate()
  const location = useLocation()
  const modal = useModal()

  const query = useQuery({
    queryKey: ['task', taskId],
    queryFn: () => getTaskById(taskId),
    enabled: !!taskId,
    retry: false,
  })

  const del = useMutation({
    mutationFn: (targetId: string) => deleteTask(targetId),
  })

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })

  const errorStatus = useMemo(() => {
    const e = query.error
    if (!e) return null
    return e instanceof ApiError ? e.status : null
  }, [query.error])

  useEffect(() => {
    if (errorStatus !== 401) return
    const redirectTo = encodeURIComponent(location.pathname + location.search)
    navigate(`/login?redirectTo=${redirectTo}`, { replace: true })
  }, [errorStatus, location.pathname, location.search, navigate])

  const task = query.data as Task | undefined

  const openDeleteModal = () => {
    modal.confirm({
      title: '삭제 확인',
      content: (
        <DeleteConfirmContent
          taskId={taskId}
          onValidChange={valid => {
            modal.update({ confirmDisabled: !valid })
          }}
        />
      ),
      confirmText: '제출',
      cancelText: '취소',
      onConfirm: async () => {
        try {
          await del.mutateAsync(taskId)
          navigate('/tasks', { replace: true })
        } catch (e) {
          const msg = e instanceof Error ? e.message : '삭제에 실패했습니다.'
          modal.alert({ title: '오류', content: msg })
        }
      },
    })
  }

  if (errorStatus === 404) return <NotFoundView />

  if (query.isLoading || query.isFetching) {
    return (
      <Box sx={{ p: 2 }}>
        <Card>
          <CardContent>
            <Typography>불러오는 중...</Typography>
          </CardContent>
        </Card>
      </Box>
    )
  }

  if (query.isError && errorStatus !== 401 && errorStatus !== 404) {
    const msg = query.error instanceof Error ? query.error.message : '요청에 실패했습니다.'
    return (
      <Box sx={{ p: 2 }}>
        <Card>
          <CardContent>
            <Stack spacing={1.5}>
              <Typography variant="h6" fontWeight={700}>
                오류
              </Typography>
              <Typography color="text.secondary">{msg}</Typography>
              <Button variant="contained" onClick={() => navigate('/tasks', { replace: true })}>
                목록으로
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    )
  }

  if (!task) return null

  return (
    <Box sx={{ p: 2 }}>
      <Card>
        <CardContent>
          <Stack spacing={1}>
            <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
              <Typography variant="h5" fontWeight={800}>
                {task.title}
              </Typography>

              <Chip
                size="small"
                color={task.status === 'TODO' ? 'primary' : 'default'}
                label={task.status === 'TODO' ? '진행 중' : '완료'}
              />
            </Stack>

            <Typography variant="body2" color="text.secondary">
              등록일시: {formatDate(task.registerDatetime)}
            </Typography>

            <Divider sx={{ my: 1 }} />

            <Typography>{task.memo}</Typography>

            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Button variant="outlined" onClick={() => navigate('/tasks')}>
                목록
              </Button>
              <Button color="error" variant="contained" onClick={openDeleteModal}>
                삭제
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  )
}
