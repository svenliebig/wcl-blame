const regex = /https:\/\/www.warcraftlogs.com\/reports\/([a-zA-Z0-9]+).*/;

export function getTokenFromUrl(url: string) {
	const match = regex.exec(url);
	return match?.[1];
}
