import { MeetingType } from '@/api'

const MEETING_TYPE_COLORS: Record<string, string> = {
  [MeetingType.NEW_PATIENT_CONSULTATION]: '#3b82f6',
  [MeetingType.FOLLOW_UP_CONSULTATION]: '#8b5cf6',
  [MeetingType.PELLET_INSERTION]: '#10b981',
  [MeetingType.BOTOX_AND_FILLER]: '#f59e0b',
  [MeetingType.IV_THERAPY]: '#06b6d4',
  [MeetingType.GENERAL]: '#64748b',
}

export function meetingTypeColor(type: MeetingType): string {
  return MEETING_TYPE_COLORS[type] ?? '#64748b'
}
