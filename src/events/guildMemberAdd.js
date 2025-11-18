import {
    TextDisplayBuilder,
    MediaGalleryItemBuilder,
    MediaGalleryBuilder,
    ContainerBuilder,
    MessageFlags,
    AttachmentBuilder,
} from 'discord.js'

import {
    EMOJIS,
    CHANNELS
} from '../constants.js'

export function onGuildMemberAdd() {
    return async (member) => {

        const text = new TextDisplayBuilder().setContent(`Welcome to FairPlay <@${member.id}>! ${EMOJIS.PEPE_GUYS_BOUNCING}\nGive him a warm welcome in <#${CHANNELS.TEXT_EN}> or <#${CHANNELS.VOCAL_EN}>!`)

        const attachment = new AttachmentBuilder('./src/images/welcome_fp.png', { name: 'welcome.png' })

        const item = new MediaGalleryItemBuilder()
            .setURL('attachment://welcome.png')
        const gallery = new MediaGalleryBuilder().addItems(item)

        const container = new ContainerBuilder()
            .addTextDisplayComponents(text)
            .addMediaGalleryComponents(gallery)

        const channel = await member.guild.channels.cache.get(CHANNELS.WELCOME)
        await channel.send({
            flags: MessageFlags.IsComponentsV2,
            components: [container],
            files: [attachment]
        })
    }
}