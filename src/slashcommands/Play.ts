import {
	ApplicationCommandDataResolvable,
	CommandInteraction,
	CacheType,
	GuildMember,
	MessageEmbed,
} from 'discord.js';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import { Bot } from '../Bot';
import { SlashCommand } from './SlashCommand';
import { player, playOptions } from '../index';
import { QueryType } from 'discord-player';

export class Play implements SlashCommand {
	name: string = 'play';
	registerData: ApplicationCommandDataResolvable = {
		name: this.name,
		description: 'Play a song in the voice channel.',
		options: [
			{
				name: 'query',
				description: 'The song or playlist you want to queue',
				type: ApplicationCommandOptionTypes.STRING,
				required: true,
			},
		],
	};
	requiredPermissions: bigint[] = [];
	async run(
		bot: Bot,
		interaction: CommandInteraction<CacheType>
	): Promise<void> {
		await interaction.deferReply();
		const guild = bot.client.guilds.cache.get(interaction.guild!.id);
		const channel = guild?.channels.cache.get(interaction.channelId);
		const query = interaction.options.getString('query')!;
		const searchResult = await player
			.search(query, {
				requestedBy: interaction.user,
				searchEngine: QueryType.AUTO,
			})
			.catch(() => {});
		if (!searchResult || !searchResult.tracks.length)
			return void interaction.editReply('no results were found');

		const queue = await player.createQueue(guild!, playOptions);
		const member =
			guild?.members.cache.get(interaction.user.id) ??
			(await guild?.members.fetch(interaction.user.id));
		try {
			if (!queue.connection) await queue.connect(member?.voice.channel!);
		} catch {
			void player.deleteQueue(guild!.id);
			return void interaction.editReply('Could not join your voice channel');
		}
		const embed = new MessageEmbed().setColor('BLUE');
		if (searchResult.playlist) {
			embed
				.setTitle(
					`Queuing playlist: ${searchResult.playlist.title} by ${searchResult.playlist.author.name}`
				)
				.setThumbnail(searchResult.playlist.thumbnail)
				.setURL(searchResult.playlist.url);
		}
		embed
			.setDescription(
				`Loading Song: **${searchResult.tracks[0].title}** by, *${searchResult.tracks[0].author}*`
			)
			.setFooter({
				text: `Requested by ${searchResult.tracks[0].requestedBy.tag}`,
				iconURL: searchResult.tracks[0].requestedBy.avatarURL()!,
			});
		await interaction.editReply({ embeds: [embed] });

		searchResult.playlist
			? queue.addTracks(searchResult.tracks)
			: queue.addTrack(searchResult.tracks[0]);
		let track = searchResult.tracks[0];
		if (!queue.playing) {
			embed.setDescription(
				`Playing first: **${track.title}**, by *${track.author}* (${track.duration})`
			);
			await queue.play();
		} else {
			searchResult.playlist
				? embed.setDescription('Playlist added to the queue!')
				: embed.setDescription(
						`**${track.title}**, by *${track.author}* (${track.duration}) added to the queue!`
				  );
		}
		interaction.editReply({ embeds: [embed] });
	}
	guildRequired?: boolean | undefined = true;
	managerRequired?: boolean | undefined;
}
``;