import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

type EntityType = 'source' | 'file' | 'folder' | 'skill'

type HintSegment =
  | { type: 'text'; content: string }
  | { type: 'entity'; entityType: EntityType; label: string; provider?: string }

interface ParsedHint {
  id: string
  segments: HintSegment[]
}

const HINT_TEMPLATES_ZH = [
  '总结您的 {source:Gmail} 收件箱，起草回复，并保存笔记到 {source:TwoPixel}',
  '将 {file:截图} 转换为您 {folder} 中的工作网站',
  '从 {source:Linear} 拉取问题，在 {source:Slack} 中研究，发布修复',
  '转录 {file:语音备忘录} 并转换为 {source:Notion} 任务',
  '分析 {file:电子表格} 并将洞察发布到 {source:Slack}',
  '审查 {source:GitHub} PR，然后在 {source:TwoPixel} 中总结更改',
  '解析 {file:发票PDF} 并记录到 {source:Google Sheets}',
  '使用 {source:Exa} 研究，撰写报告，保存到您的 {source:Obsidian} 库',
  '重构您 {folder} 中的代码，然后推送到 {source:GitHub}',
  '将 {source:日历} 事件与 {source:Linear} 项目截止日期同步',
  '将会议 {file:笔记} 自动转换为 {source:Jira} 工单',
  '查询您的 {source:数据库} 并在新 {file:文档} 中可视化结果',
  '获取 {source:Figma} 设计并在您的 {folder} 中生成 React 组件',
  '将 {source:Slack} 话题合并为 {source:Notion} 的每周摘要',
  '运行 {skill} 分析您的代码库并修复您 {folder} 中的问题',
]

const HINT_TEMPLATES_EN = [
  'Summarize your {source:Gmail} inbox, draft replies, and save notes to {source:TwoPixel}',
  'Turn a {file:screenshot} into a working website in your {folder}',
  'Pull issues from {source:Linear}, research in {source:Slack}, ship the fix',
  'Transcribe a {file:voice memo} and turn it into {source:Notion} tasks',
  'Analyze a {file:spreadsheet} and post insights to {source:Slack}',
  'Review {source:GitHub} PRs, then summarize changes in {source:TwoPixel}',
  'Parse an {file:invoice PDF} and log it to {source:Google Sheets}',
  'Research with {source:Exa}, write it up, save to your {source:Obsidian} vault',
  'Refactor code in your {folder}, then push to {source:GitHub}',
  'Sync {source:Calendar} events with {source:Linear} project deadlines',
  'Turn meeting {file:notes} into {source:Jira} tickets automatically',
  'Query your {source:database} and visualize results in a new {file:document}',
  'Fetch {source:Figma} designs and generate React components in your {folder}',
  'Combine {source:Slack} threads into a weekly digest for {source:Notion}',
  'Run a {skill} to analyze your codebase and fix issues in your {folder}',
]

// ============================================================================
// Parsing
// ============================================================================

/**
 * Parse a hint template into segments
 * Tokens: {source:Gmail}, {file:screenshot}, {folder}, {skill}
 */
function parseHintTemplate(template: string, id: string): ParsedHint {
  const segments: HintSegment[] = []
  // Regex matches {type} or {type:label}
  const tokenRegex = /\{(source|file|folder|skill)(?::([^}]+))?\}/g

  let lastIndex = 0
  let match

  while ((match = tokenRegex.exec(template)) !== null) {
    // Add text before the token
    if (match.index > lastIndex) {
      segments.push({
        type: 'text',
        content: template.slice(lastIndex, match.index),
      })
    }

    const entityType = match[1] as EntityType
    const labelOrProvider = match[2]

    // For source type, the second part is the provider/label
    // For other types, it's just a custom label
    if (entityType === 'source') {
      segments.push({
        type: 'entity',
        entityType,
        label: labelOrProvider || 'source',
        provider: labelOrProvider?.toLowerCase(),
      })
    } else {
      segments.push({
        type: 'entity',
        entityType,
        label: labelOrProvider || entityType,
      })
    }

    lastIndex = match.index + match[0].length
  }

  // Add remaining text
  if (lastIndex < template.length) {
    segments.push({
      type: 'text',
      content: template.slice(lastIndex),
    })
  }

  return { id, segments }
}

function parseAllHints(templates: string[]): ParsedHint[] {
  return templates.map((template, index) => parseHintTemplate(template, `hint-${index}`))
}

interface EntityBadgeProps {
  entityType: EntityType
  label: string
  provider?: string
}

function EntityBadge({ label }: EntityBadgeProps) {
  return (
    <span className="inline-flex pl-[8px] pr-[10px] py-0.5 mx-[2px] rounded-[8px] bg-foreground/5 shadow-minimal text-foreground/40">
      {label}
    </span>
  )
}

export interface EmptyStateHintProps {
  hintIndex?: number
  className?: string
}

export function EmptyStateHint({ hintIndex, className }: EmptyStateHintProps) {
  const { i18n } = useTranslation()
  const templates = i18n.language === 'zh-CN' ? HINT_TEMPLATES_ZH : HINT_TEMPLATES_EN
  const allHints = React.useMemo(() => parseAllHints(templates), [templates])

  const [selectedIndex] = React.useState(() => {
    if (hintIndex !== undefined && hintIndex >= 0 && hintIndex < allHints.length) {
      return hintIndex
    }
    return Math.floor(Math.random() * allHints.length)
  })

  const displayIndex = hintIndex !== undefined ? hintIndex : selectedIndex
  const hint = allHints[displayIndex % allHints.length]

  return (
    <div
      className={cn(
        'text-center leading-relaxed tracking-tight',
        'max-w-md mx-auto select-none',
        'text-[20px] font-bold text-black',
        className
      )}
    >
      {hint.segments.map((segment, index) => {
        if (segment.type === 'text') {
          return <span key={index}>{segment.content}</span>
        }

        return (
          <EntityBadge
            key={index}
            entityType={segment.entityType}
            label={segment.label}
            provider={segment.provider}
          />
        )
      })}
    </div>
  )
}

export function getHintCount(i18n: { language: string }): number {
  const templates = i18n.language === 'zh-CN' ? HINT_TEMPLATES_ZH : HINT_TEMPLATES_EN
  return templates.length
}

export function getHintTemplate(index: number, i18n: { language: string }): string {
  const templates = i18n.language === 'zh-CN' ? HINT_TEMPLATES_ZH : HINT_TEMPLATES_EN
  return templates[index % templates.length]
}
