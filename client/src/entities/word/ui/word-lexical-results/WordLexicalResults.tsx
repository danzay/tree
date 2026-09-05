import { useTranslation } from 'react-i18next'
import { Tab, TabList, TabPanel, Tabs } from 'react-aria-components'
import type { WordInfo } from '../../model/useWordInfo'
import { WordLexicalContent } from './WordLexicalContent'
import { getPartOfSpeechGroups } from './utils/getPartOfSpeechGroups'
import styles from './WordLexicalResults.module.scss'

interface WordLexicalResultsProps {
  definitionFallback?: string | null
  wordInfo: WordInfo
  partOfSpeechHints?: string[]
  translationFallback?: string[]
}

export function WordLexicalResults({
  definitionFallback,
  wordInfo,
  partOfSpeechHints = [],
  translationFallback,
}: WordLexicalResultsProps) {
  const { t } = useTranslation()
  const unknownLabel = t('word.card.unknownPartOfSpeech')
  const groups = getPartOfSpeechGroups(wordInfo, partOfSpeechHints, unknownLabel)
  const withGroups = groups.length > 0
  const withTabs = groups.length > 1

  if (!withGroups) {
    return (
      <div className={styles.container}>
        <WordLexicalContent
          definitionFallback={definitionFallback}
          wordInfo={wordInfo}
          translationFallback={translationFallback}
        />
      </div>
    )
  }

  if (!withTabs) {
    const group = groups[0]

    return (
      <div className={styles.container}>
        <p className={styles.partOfSpeech}>{group.label}</p>
        <WordLexicalContent
          definitionFallback={definitionFallback}
          wordInfo={wordInfo}
          partOfSpeech={group.partOfSpeech}
          translationFallback={translationFallback}
        />
      </div>
    )
  }

  const tabsKey = `${wordInfo.term}-${groups.map((group) => group.id).join('-')}`

  return (
    <Tabs className={styles.container} defaultSelectedKey={groups[0].id} key={tabsKey}>
      <TabList className={styles.tabList} aria-label={t('word.lexical.partOfSpeechTabs')}>
        {groups.map((group) => (
          <Tab className={styles.tab} id={group.id} key={group.id}>
            {group.label}
          </Tab>
        ))}
      </TabList>
      {groups.map((group) => (
        <TabPanel className={styles.tabPanel} id={group.id} key={group.id}>
          <WordLexicalContent
            definitionFallback={definitionFallback}
            wordInfo={wordInfo}
            partOfSpeech={group.partOfSpeech}
            translationFallback={translationFallback}
          />
        </TabPanel>
      ))}
    </Tabs>
  )
}
