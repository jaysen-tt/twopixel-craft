import { useTranslation } from 'react-i18next'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useRegisterModal } from "@/context/ModalContext"
import { isMac } from "@/lib/platform"
import { actionsByCategory, useActionLabel, type ActionId } from "@/actions"

interface KeyboardShortcutsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface ShortcutItem {
  keys: string[]
  descriptionKey: string
}

interface ShortcutSection {
  titleKey: string
  shortcuts: ShortcutItem[]
}

const componentSpecificSections: ShortcutSection[] = [
  {
    titleKey: 'dialog.keyboardShortcuts.listNavigation',
    shortcuts: [
      { keys: ['↑', '↓'], descriptionKey: 'dialog.keyboardShortcuts.navigateItems' },
      { keys: ['Home'], descriptionKey: 'dialog.keyboardShortcuts.goToFirst' },
      { keys: ['End'], descriptionKey: 'dialog.keyboardShortcuts.goToLast' },
    ],
  },
  {
    titleKey: 'dialog.keyboardShortcuts.sessionList',
    shortcuts: [
      { keys: ['Enter'], descriptionKey: 'dialog.keyboardShortcuts.focusChat' },
      { keys: ['Delete'], descriptionKey: 'dialog.keyboardShortcuts.deleteSession' },
      { keys: ['R'], descriptionKey: 'dialog.keyboardShortcuts.renameSession' },
      { keys: ['Right-click'], descriptionKey: 'dialog.keyboardShortcuts.openContextMenu' },
      { keys: [isMac ? '⌥' : 'Alt', 'Click'], descriptionKey: 'dialog.keyboardShortcuts.addFilterExcluded' },
    ],
  },
  {
    titleKey: 'dialog.keyboardShortcuts.agentTree',
    shortcuts: [
      { keys: ['←'], descriptionKey: 'dialog.keyboardShortcuts.collapseFolder' },
      { keys: ['→'], descriptionKey: 'dialog.keyboardShortcuts.expandFolder' },
    ],
  },
  {
    titleKey: 'dialog.keyboardShortcuts.chatInput',
    shortcuts: [
      { keys: ['Enter'], descriptionKey: 'dialog.keyboardShortcuts.sendMessage' },
      { keys: ['Shift', 'Enter'], descriptionKey: 'dialog.keyboardShortcuts.newLine' },
      { keys: ['Esc'], descriptionKey: 'dialog.keyboardShortcuts.closeDialog' },
    ],
  },
]

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[11px] font-medium font-sans bg-muted border border-border rounded shadow-sm">
      {children}
    </kbd>
  )
}

/**
 * Renders a shortcut row for an action from the registry
 */
function ActionShortcutRow({ actionId }: { actionId: ActionId }) {
  const { label, hotkey } = useActionLabel(actionId)

  if (!hotkey) return null

  // Split hotkey into individual keys for display
  // Mac: symbols are concatenated (⌘⇧N) - need smart splitting
  // Windows: separated by + (Ctrl+Shift+N) - split on +
  const keys = isMac
    ? hotkey.match(/[⌘⇧⌥←→]|Tab|Esc|./g) || []
    : hotkey.split('+')

  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-sm">{label}</span>
      <div className="flex items-center gap-1">
        {keys.map((key, keyIndex) => (
          <Kbd key={keyIndex}>{key}</Kbd>
        ))}
      </div>
    </div>
  )
}

/**
 * Renders a section of shortcuts from the registry
 */
function RegistrySection({ category, actionIds }: { category: string; actionIds: ActionId[] }) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
        {category}
      </h3>
      <div className="space-y-1.5">
        {actionIds.map(actionId => (
          <ActionShortcutRow key={actionId} actionId={actionId} />
        ))}
      </div>
    </div>
  )
}

function StaticSection({ section }: { section: ShortcutSection }) {
  const { t } = useTranslation()
  return (
    <div>
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
        {t(section.titleKey)}
      </h3>
      <div className="space-y-1.5">
        {section.shortcuts.map((shortcut, index) => (
          <div key={index} className="flex items-center justify-between py-1">
            <span className="text-sm">{t(shortcut.descriptionKey)}</span>
            <div className="flex items-center gap-1">
              {shortcut.keys.map((key, keyIndex) => (
                <Kbd key={keyIndex}>{key}</Kbd>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function KeyboardShortcutsDialog({ open, onOpenChange }: KeyboardShortcutsDialogProps) {
  const { t } = useTranslation()
  useRegisterModal(open, () => onOpenChange(false))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('dialog.keyboardShortcuts.title')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-2">
          {Object.entries(actionsByCategory).map(([category, actions]) => (
            <RegistrySection
              key={category}
              category={category}
              actionIds={actions.map(a => a.id as ActionId)}
            />
          ))}

          {componentSpecificSections.map((section) => (
            <StaticSection key={section.titleKey} section={section} />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
