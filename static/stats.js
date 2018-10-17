Chart.defaults.global.animation.duration = 400

;(async () => {
	const gameStats = await api.getStats()

	const userCounts = new Chart(document.querySelector('#totalUsers'), {
		'type': 'line',
		'options': {
			'elements': {
				'line': {
					'tension': 0
				}
			}
		},
		'data': {
			'labels': gameStats.statTimeKeys,
			'datasets': [
				{
					'label': 'Daily Active Users',
					'data': gameStats.uniqueDailyPlayerCounts,
					'backgroundColor': '#C2E7F2',
					'borderColor': '#3E4E59',
					'pointRadius': 10,
					'pointHoverRadius': 8
				},
				{
					'label': 'Total Users',
					'data': gameStats.registeredUserCounts,
					'backgroundColor': '#A8EAC0',
					'borderColor': '#3E4E59',
					'pointRadius': 10,
					'pointHoverRadius': 8
				}
			]
		}
	})

	const gameCounts = new Chart(document.querySelector('#gamesPlayed'), {
		'type': 'line',
		'options': {
			'elements': {
				'line': {
					'tension': 0
				}
			}
		},
		'data': {
			'labels': gameStats.statTimeKeys,
			'datasets': [
				{
					'label': 'Daily Games',
					'data': gameStats.gameCounts,
					'backgroundColor': '#F25652',
					'borderColor': '#3E4E59',
					'pointRadius': 10,
					'pointHoverRadius': 8
				}
			]
		}
	})
})()