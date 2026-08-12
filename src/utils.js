export function shuffle(items) {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export function cleanLines(value) {
  const seen = new Set()
  return value
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter((item) => {
      const key = item.toLocaleLowerCase()
      if (!item || seen.has(key)) return false
      seen.add(key)
      return true
    })
}

export function countLabel(count, singular, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`
}

export function makePairs(students) {
  const mixed = shuffle(students)
  const groups = []
  let cursor = 0
  if (mixed.length % 2 === 1 && mixed.length >= 3) {
    while (cursor < mixed.length - 3) {
      groups.push(mixed.slice(cursor, cursor + 2))
      cursor += 2
    }
    groups.push(mixed.slice(cursor))
  } else {
    while (cursor < mixed.length) {
      groups.push(mixed.slice(cursor, cursor + 2))
      cursor += 2
    }
  }
  return groups
}

export function makeTeams(students, numberOfTeams) {
  const teams = Array.from({ length: numberOfTeams }, () => [])
  shuffle(students).forEach((student, index) => {
    teams[index % numberOfTeams].push(student)
  })
  return teams
}
