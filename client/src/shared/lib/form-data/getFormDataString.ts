export function getFormDataString(data: FormData, name: string) {
  const value = data.get(name)

  return typeof value === 'string' ? value : ''
}
