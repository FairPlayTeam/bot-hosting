function sanitizeInput(input) {
	return input
		.replace(/@everyone/gi, '[everyone]')
		.replace(/@here/gi, '[here]')
		.replace(/<@!?(\d+)>/g, '[user]')
		.replace(/<@&(\d+)>/g, '[role]')
		.trim()
}

export { sanitizeInput }