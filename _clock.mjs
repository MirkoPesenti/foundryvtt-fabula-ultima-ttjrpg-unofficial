// Hooks.once('init', () => {
// 	console.log('Progress Bar Tool | Initializing');
  
// 	// Aggiungi un pulsante alla barra degli strumenti
// 	Hooks.on('getSceneControlButtons', controls => {
// 	  controls.push({
// 		name: 'progress-bar',
// 		title: 'Progress Bar Tool',
// 		icon: 'fas fa-tasks',
// 		layer: 'controls',
// 		tools: [
// 		  {
// 			name: 'create-progress-bar',
// 			title: 'Create Progress Bar',
// 			icon: 'fas fa-plus-circle',
// 			onClick: createProgressBarDialog
// 		  }
// 		]
// 	  });
// 	});
//   });
  
//   function createProgressBarDialog() {
// 	new Dialog({
// 	  title: "Create Progress Bar",
// 	  content: `
// 		<form>
// 		  <div class="form-group">
// 			<label>Number of Sections (3-12):</label>
// 			<input type="number" id="sections" min="3" max="12" value="3"/>
// 		  </div>
// 		  <div class="form-group">
// 			<label>Visibility:</label>
// 			<select id="visibility">
// 			  <option value="public">Public</option>
// 			  <option value="private">Private</option>
// 			</select>
// 		  </div>
// 		</form>
// 	  `,
// 	  buttons: {
// 		create: {
// 		  label: "Create",
// 		  callback: html => {
// 			const sections = parseInt(html.find('#sections').val());
// 			const visibility = html.find('#visibility').val();
// 			createProgressBar(sections, visibility);
// 		  }
// 		},
// 		cancel: {
// 		  label: "Cancel"
// 		}
// 	  },
// 	  default: "create"
// 	}).render(true);
//   }
  
//   function createProgressBar(sections, visibility) {
// 	const progressBar = {
// 	  sections: Array(sections).fill(false), // false = not completed, true = completed
// 	  visibility: visibility,
// 	  id: randomID()
// 	};
  
// 	if (visibility === "public") {
// 	  game.socket.emit('module.progress-bar-tool', { action: 'create', data: progressBar });
// 	} else {
// 	  renderProgressBar(progressBar);
// 	}
//   }
  
//   function renderProgressBar(progressBar) {
// 	const container = document.createElement('div');
// 	container.className = 'progress-bar-container';
// 	container.id = `progress-bar-${progressBar.id}`;
  
// 	progressBar.sections.forEach((completed, index) => {
// 	  const section = document.createElement('div');
// 	  section.className = `progress-bar-section ${completed ? 'completed' : ''}`;
// 	  section.dataset.index = index;
// 	  section.addEventListener('click', () => {
// 		toggleProgressSection(progressBar, index);
// 	  });
// 	  container.appendChild(section);
// 	});
  
// 	document.body.appendChild(container);
//   }
  
//   function toggleProgressSection(progressBar, index) {
// 	progressBar.sections[index] = !progressBar.sections[index];
// 	const section = document.querySelector(`#progress-bar-${progressBar.id} .progress-bar-section[data-index="${index}"]`);
// 	section.classList.toggle('completed');
//   }
  
//   Hooks.once('ready', () => {
// 	game.socket.on('module.progress-bar-tool', data => {
// 	  if (data.action === 'create') {
// 		renderProgressBar(data.data);
// 	  }
// 	});
//   });
  