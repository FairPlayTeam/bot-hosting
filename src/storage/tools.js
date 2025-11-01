export function getImagesFromAttachments(attachments) {
    const imagesCollection = message.attachments
      .filter(attachment => {
        return attachment.contentType && attachment.contentType.startWith('image/')
      })
      .map((attachment, snowflake) => [snowflake, attachment.url])

    const images = Array.from(imagesCollection.values())
    return images
}

export function format2Digits(digitStr) {
  return '00'.substring(0, 2 - digitStr.length) + digitStr
}

export function getTime() {
  return `${format2Digits(String(new Date().getDate()))}/${format2Digits(String(new Date().getMonth()))}/${format2Digits(String(new Date().getFullYear()))} ${format2Digits(String(new Date().getHours()))}:${format2Digits(String(new Date().getMinutes()))}`
}