import { useEffect, useMemo, useRef } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useVirtualizer } from '@tanstack/react-virtual'
import { Box, Card, CardContent, Chip, Stack, Typography } from '@mui/material'
import { useLocation, useNavigate } from 'react-router-dom'
import { getTasks } from '@/features/task/api/task.api'
import { useModal } from '@/app/providers/modal/useModal'
import { useAuth } from '@/app/providers/auth/useAuth'

export default function Tasks() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const modal = useModal()

  const parentRef = useRef<HTMLDivElement>(null)

  const query = useInfiniteQuery({
    queryKey: ['tasks'],
    initialPageParam: 1,
    queryFn: ({ pageParam }) => getTasks(pageParam),
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length === 0) return undefined
      return allPages.length + 1
    },
  })

  const items = useMemo(() => query.data?.pages.flat() ?? [], [query.data])

  const rowVirtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 110,
    overscan: 8,
  })

  useEffect(() => {
    const virtualItems = rowVirtualizer.getVirtualItems()
    const last = virtualItems[virtualItems.length - 1]
    if (!last) return

    if (last.index >= items.length - 1 && query.hasNextPage && !query.isFetchingNextPage) {
      query.fetchNextPage()
    }
  }, [items.length, query, rowVirtualizer])

  useEffect(() => {
    if (!query.error) return

    const e = query.error as { message: string; status?: number }
    if (e.status === 401) {
      logout()
      const redirectTo = encodeURIComponent(location.pathname + location.search)
      navigate(`/login?redirectTo=${redirectTo}`, { replace: true })
      return
    }

    if (e.status === 400) {
      modal.alert({
        title: '오류',
        content: e.message,
        confirmText: '목록으로',
        onClose: () => navigate('/', { replace: true }),
      })
    }
  }, [query, location, navigate, modal, logout])

  return (
    <Box
      ref={parentRef}
      sx={{
        height: 'calc(100vh - 64px)',
        overflow: 'auto',
        px: 2,
      }}
    >
      <Box sx={{ height: rowVirtualizer.getTotalSize(), position: 'relative' }}>
        {rowVirtualizer.getVirtualItems().map(v => {
          const task = items[v.index]
          if (!task) return null

          return (
            <Box
              key={v.key}
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${v.start}px)`,
                py: 1,
              }}
            >
              <Card
                sx={{ cursor: 'pointer' }}
                onClick={() => navigate(`/tasks/${encodeURIComponent(task.id)}`)}
              >
                <CardContent>
                  <Stack flexDirection="row" alignItems="center">
                    <Chip
                      size="small"
                      color={task.status === 'TODO' ? 'primary' : 'default'}
                      label={task.status === 'TODO' ? '진행 중' : '완료'}
                      sx={
                        task.status === 'DONE'
                          ? {
                              bgcolor: theme => theme.palette.action.disabledBackground,
                              color: theme => theme.palette.action.disabled,
                            }
                          : undefined
                      }
                    />
                    <Typography variant="h6" sx={{ ml: 1 }}>
                      {task.title}
                    </Typography>
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    {task.memo}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          )
        })}
      </Box>
    </Box>
  )
}
