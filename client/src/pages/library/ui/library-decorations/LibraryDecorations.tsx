import leafLeft from '@/assets/library/leaf-left.svg'
import leafRight from '@/assets/library/leaf-right.svg'
import leafStem from '@/assets/library/leaf-stem.svg'
import styles from './LibraryDecorations.module.scss'

export function LibraryDecorations() {
  return (
    <>
      <div className={styles.botanical} aria-hidden="true">
        <img className={styles.left} src={leafLeft} alt="" />
        <img className={styles.right} src={leafRight} alt="" />
        <img className={styles.stem} src={leafStem} alt="" />
      </div>
      <span className={styles.tape} aria-hidden="true" />
    </>
  )
}
