import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'

dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

export const formatDate = (date: string | Date, format = 'YYYY-MM-DD'): string => {
  return dayjs(date).format(format)
}

export const formatDateTime = (date: string | Date): string => {
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

export const formatTime = (time: string): string => {
  return time
}

export const getRelativeTime = (date: string | Date): string => {
  return dayjs(date).fromNow()
}

export const getDaysDiff = (start: string | Date, end: string | Date): number => {
  return dayjs(end).diff(dayjs(start), 'day') + 1
}

export const getDayOfWeek = (date: string | Date): string => {
  //换成中文
  const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return days[dayjs(date).day()]
}

export const isToday = (date: string | Date): boolean => {
  return dayjs(date).isSame(dayjs(), 'day')
}

export const isFuture = (date: string | Date): boolean => {
  return dayjs(date).isAfter(dayjs())
}

export const isPast = (date: string | Date): boolean => {
  return dayjs(date).isBefore(dayjs())
}

export { dayjs }

