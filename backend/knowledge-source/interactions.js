var interactions = {
	click: function (element, sync, autowaits, eventsAfter, eventsBefore) {
		if (sync) {
			return interactions.syncClick(element, autowaits, eventsAfter);
		}
		return new Promise((resolve, reject) => {
			scrollIntoViewCenter(element);
			let waits = ['attached', 'visible', 'stable', 'receives events', 'enabled'];
			if (autowaits?.length && Array.isArray(autowaits)) {
				waits = autowaits;
			}
			actionability.waitFor(waits, element).then(() => {
				window.setTimeout(function () {
					if (eventsBefore?.length && Array.isArray(eventsBefore)) {
						for (const event of eventsBefore) {
							element.dispatchEvent(new Event(event));
						}
						if (!eventsBefore.includes('click')) {
							element.click();
						}
					} else {
						element.click();
					}
					if (eventsAfter?.length && Array.isArray(eventsAfter)) {
						for (const event of eventsAfter) {
							element.dispatchEvent(new Event(event));
						}
					}
				}, 100);
				resolve();
			}).catch(e => reject(e));
		});
	},

	hover: function (element) {
		return new Promise((resolve, reject) => {
			scrollIntoViewCenter(element);
			actionability.waitFor(['attached', 'visible', 'stable'], element).then(() => {
				const mouseoverEvent = new Event('mouseover');
				element.dispatchEvent(mouseoverEvent);
				resolve();
			}).catch(e => reject(e));
		});
	},

	syncClick: function (element, autowaits, events) {
		return new Promise((resolve, reject) => {
			scrollIntoViewCenter(element);
			let waits = ['attached', 'visible', 'stable', 'receives events', 'enabled'];
			if (autowaits?.length && Array.isArray(autowaits)) {
				waits = autowaits;
			}
			actionability.waitFor(waits, element).then(() => {
				element.click();
				if (events?.length && Array.isArray(events)) {
					for (const event of events) {
						element.dispatchEvent(new Event(event));
					}
				}
				resolve();
			}).catch(e => {
				reject(e)
			})
		})
	},

	set: function (element, value, elementLabel, eventsAfter, eventsBefore, autowaits) {
		return new Promise((resolve, reject) => {
			scrollIntoViewCenter(element);
			const lastLogEntry = logEntries[logEntries.length - 1];
			elementLabel = !elementLabel ? element.tagName.toLowerCase() : elementLabel;
			lastLogEntry.diagnosticLogs.push(new LogEntry(LOGGING_LEVEL.DIAGNOSTIC, 'Executing set interaction for element : ' + elementLabel));
			let waits = ['attached', 'visible', 'enabled', 'editable'];
			if (autowaits?.length && Array.isArray(autowaits)) {
				waits = autowaits;
			}
			actionability.waitFor(waits, element).then(() => {
				if (eventsBefore?.length && Array.isArray(eventsBefore)) {
					for (const event of eventsBefore) {
						window.setTimeout(function () {
							element.dispatchEvent(new Event(event));
						}, 25);
					}
				}
				element.value = value;

				let events = ['input', 'change', 'blur'];
				if (eventsAfter?.length && Array.isArray(eventsAfter)) {
					events = eventsAfter;
				}
				for (const event of events) {
					window.setTimeout(function () {
						window.setTimeout(function () {
							element.dispatchEvent(new Event(event));
						}, 25);
					},);
				}
				resolve();
			}).catch(e => reject(e));
		});
	},

	setNow: function (element, isDateField) {
		const nowValue = new Date();
		const lastLogEntry = logEntries[logEntries.length - 1];
		lastLogEntry.diagnosticLogs.push(new LogEntry(LOGGING_LEVEL.DIAGNOSTIC, 'Setting value to  ' + (isDateField ? nowValue.toLocaleDateString() : nowValue.toLocaleString())));
		return interactions.set(element, nowValue.toISOString());
	},

	setForRichText: function (element, value, elementLabel, eventsAfter, eventsBefore, autowaits) {
		return interactions.set(element, value, elementLabel, ['nooperation'], ['focus'], autowaits)
			.then(() => {
				const eventInit = {
					bubbles: true,
					detail: { value: element.value }
				};
				['input', 'change', 'blur'].forEach(evt =>
					element.dispatchEvent(new CustomEvent(evt, eventInit))
				);
			});
	},


	setForCheckBoxGroup: function (element, fieldArguments, value) {
		return new Promise((resolve, reject) => {
			scrollIntoViewCenter(element);
			actionability.waitFor(['attached', 'visible', 'stable', 'receives events', 'enabled'], element).then(() => {
				const labels = fieldArguments?.split(',');
				const options = JSON.parse(JSON.stringify(element.options));
				for (let index = 0; index < labels.length; index++) {
					const label = labels[index].trim();
					const option = options?.find(f => f.label === label);
					if (option) {
						const inputElem = element.shadowRoot.querySelector("input[value='" + option.value + "']");
						inputElem.checked = value;
						inputElem.dispatchEvent(new Event('change'));
						inputElem.dispatchEvent(new Event('blur'));
					} else {
						reject('error');
						return;
					}
				}
				resolve();
			}).catch(e => reject(e));
		});
	},

	setAllCheckBoxGroup: function (element, value) {
		return new Promise((resolve, reject) => {
			scrollIntoViewCenter(element);
			actionability.waitFor(['attached', 'visible', 'stable', 'receives events', 'enabled'], element).then(() => {
				const options = JSON.parse(JSON.stringify(element.options));
				for (let index = 0; index < options.length; index++) {
					let option = options[index];
					if (option) {
						const inputElem = element.shadowRoot.querySelector("input[value='" + option.value + "']");
						inputElem.checked = value;
						inputElem.dispatchEvent(new Event('change'));
						inputElem.dispatchEvent(new Event('blur'));
					} else {
						reject('error');
						return;
					}
				}
				resolve();
			}).catch(e => reject(e));
		});
	},

	setForLightningLookUp: function (element, value) {
		return new Promise(async (resolve, reject) => {
			const baseCombo = element.shadowRoot.querySelector('lightning-lookup-desktop').shadowRoot.querySelector('lightning-grouped-combobox').shadowRoot.querySelector('lightning-base-combobox');
			let button = baseCombo.shadowRoot.querySelector('button');
			if (button) {
				button.click();
			};

			setTimeout(function () {
				const input = baseCombo.shadowRoot.querySelector('input');
				input.value = value;
				input.dispatchEvent(new Event('input'));
				setTimeout(function () {
					input.dispatchEvent(new Event('keydown'));
					setTimeout(function () {
						const item = baseCombo.shadowRoot.querySelector('li lightning-base-combobox-item');
						if (!item) {
							reject('error');
							return;
						}
						const elem = item.shadowRoot.querySelector('lightning-base-combobox-formatted-text');
						if (elem) {
							elem.click();
							resolve();
						} else {
							reject('error');
							return;
						}
					}, 1500)
				}, 1500);
			}, 1000);
		});
	},

	showAllResultsForLightningLookUp: function (element, value) {
		return new Promise(async (resolve, reject) => {
			await new Promise(resolve => {
				setTimeout(() => {
					resolve();
				}, 2500)
			});
			let elem = element.shadowRoot.querySelector('lightning-lookup-desktop');
			if (elem) {
				element = elem;
			}
			elem = element.shadowRoot.querySelector('lightning-grouped-combobox');
			if (elem) {
				element = elem;
			}
			elem = element.shadowRoot.querySelector('lightning-base-combobox');
			if (elem) {
				element = elem;
			}
			let button = element.shadowRoot.querySelector('button');
			if (button) {
				button.click();
			};

			setTimeout(function () {
				const input = element.shadowRoot.querySelector('input');
				input.value = value;
				input.dispatchEvent(new Event('input'));
				setTimeout(function () {
					input.dispatchEvent(new Event('keydown'));
					setTimeout(function () {
						const item = element.shadowRoot.querySelector('div lightning-base-combobox-item');
						if (item) {
							item.click();
							resolve();
						} else {
							reject('error');
							return;
						}
					}, 1500)
				}, 1500);
			}, 1000);
		});
	},

	setForSelect: function (element, value) {
		return new Promise((resolve, reject) => {
			scrollIntoViewCenter(element);
			actionability.waitFor(['attached', 'visible', 'enabled', 'editable'], element).then(() => {
				let selectElement = element;
				if (element.shadowRoot?.querySelector("select")) {
					selectElement = element.shadowRoot.querySelector("select");
				}
				const labels = [...selectElement.querySelectorAll('option')].map(m => m.label?.trim());
				const trimmedValue = typeof value === "string" ? value.trim() : value;
				const index = labels.indexOf(trimmedValue);
				if (index < 0) {
					reject('error');
					return;
				}
				selectElement.selectedIndex = index;
				selectElement.dispatchEvent(new Event('change'));
				selectElement.dispatchEvent(new Event('blur'));
				resolve();
			}).catch(e => reject(e));
		});
	},

	setForSearchInput: function (element, value, eventsAfter) {
		return new Promise((resolve, reject) => {
			const inputElement = element.shadowRoot.querySelector('lightning-primitive-input-simple')?.shadowRoot.querySelector('input');
			scrollIntoViewCenter(element);
			const dropDownWaits = ['attached', 'visible', 'enabled'];
			const inputWaits = [...dropDownWaits, 'editable'];
			actionability.waitFor(inputWaits, inputElement).then(() => {
				inputElement.value = value;
				let events = ['input', 'change', 'focus'];
				if (eventsAfter?.length && Array.isArray(eventsAfter)) {
					events = eventsAfter;
				}
				events.forEach(event => {
					element.dispatchEvent(new Event(event, { bubbles: true }));
				});
				setTimeout(() => {
					element.dispatchEvent(new KeyboardEvent('keyup', { 'key': 'Enter', 'keyCode': '13', 'bubbles': true }));
					setTimeout(() => {
						let dropDownElement = null;
						let dropDownSelector = "select";
						const getDropDownElement = (selector) => {
							let currentElement = element;
							while (currentElement) {
								if ((currentElement.tagName && currentElement.querySelector(selector)) ||
									(currentElement !== element && currentElement.tagName?.toLowerCase().startsWith('lightning-'))) {
									break;
								}
								currentElement = currentElement.assignedSlot || currentElement.parentNode || currentElement.host || currentElement.parentElement;
							}
							return currentElement?.tagName && currentElement.querySelector(selector);
						}
						dropDownElement = getDropDownElement(dropDownSelector);
						if (!dropDownElement) {
							dropDownSelector = '[role="listbox"]';
							dropDownElement = getDropDownElement(dropDownSelector);
						}
						if (!dropDownElement) {
							resolve();
							return;
						}
						actionability.waitFor(dropDownWaits, dropDownElement).then(() => {
							if (dropDownSelector === 'select') {
								const options = dropDownElement.options || [];
								if (options.length > 0) {
									setTimeout(() => {
										dropDownElement.selectedIndex = 0;
										dropDownElement.dispatchEvent(new Event("change", { bubbles: true }));
										dropDownElement.dispatchEvent(new Event("blur"));
										resolve();
									}, 1500);
								} else {
									reject('Select options not found');
								}
							} else {
								setTimeout(() => {
									let key = dropDownElement.querySelector("[role='option']");
									let isPrimitiveOption = false;
									if (!key) {
										key = dropDownElement.querySelector("p[data-key]");
										isPrimitiveOption = !!key;
									}

									if (key) {
										if (isPrimitiveOption) {
											key.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
											key.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }));
										}
										key.click();
										if (isPrimitiveOption) {
											setTimeout(() => {
												inputElement.dispatchEvent(new Event('blur', { bubbles: true }));
												element.dispatchEvent(new Event('blur', { bubbles: true }));
											}, 0);
										}
									}
								}, 100);
								resolve();
							}
						}).catch(e => reject(e));
					}, 1500);
				}, 1000);
			}).catch(e => reject(e));
		});
	},

	setForGroupedComboBox: function (element, value) {
		return new Promise((resolve, reject) => {
			if (!element) {
				return reject(new Error("Element not found"));
			}

			actionability.waitFor(['attached', 'visible', 'enabled', 'editable'], element).then(() => {
				const baseCombo = element.shadowRoot.querySelector('lightning-base-combobox');
				if (!baseCombo) {
					return reject(new Error("Base combobox not found"));
				}

				const cancelButton = baseCombo.shadowRoot.querySelector('button.slds-input__icon_right');
				if (cancelButton) {
					cancelButton.click();
				}

				const inputElem = baseCombo.shadowRoot.querySelector('input');
				if (!inputElem) {
					return reject(new Error("Input element not found"));
				}

				inputElem.value = value;

				window.setTimeout(() => {
					inputElem.dispatchEvent(new Event('input'));
					inputElem.dispatchEvent(new Event('blur'));
					inputElem.click();

					window.setTimeout(() => {
						const item = baseCombo.shadowRoot.querySelector('lightning-base-combobox-item');
						if (item) {
							item.click();
						}
						resolve();
					}, 1500);
				}, 200);
			}).catch(e => reject(e));
		});
	},

	setForComboBox: function (element, value, elementLabel, isSetByIndex = false) {
		return new Promise((resolve, reject) => {
			scrollIntoViewCenter(element);
			const lastLogEntry = logEntries[logEntries.length - 1];
			if (elementLabel) {
				lastLogEntry.diagnosticLogs.push(new LogEntry(LOGGING_LEVEL.DIAGNOSTIC, 'Executing set interaction for element : ' + elementLabel));
			}
			actionability.waitFor(['attached', 'visible', 'enabled', 'editable'], element).then(() => {
				if (element.shadowRoot.querySelector('lightning-combobox')) {
					element = element.shadowRoot.querySelector('lightning-combobox');
				}
				let baseComboBox = null;
				if (element.shadowRoot.querySelector('lightning-base-combobox')) {
					baseComboBox = element.shadowRoot.querySelector('lightning-base-combobox');
				}
				let comboBoxTrigger = baseComboBox?.shadowRoot.querySelector('button.slds-combobox__input');
				if (!comboBoxTrigger) {
					comboBoxTrigger = element.shadowRoot.querySelector('label');
				}
				if (baseComboBox?.shadowRoot.querySelector('button:not(.slds-combobox__input)')) {
					baseComboBox?.shadowRoot.querySelector('button:not(.slds-combobox__input)').click();
				}
				if (comboBoxTrigger) {
					window.setTimeout(() => {
						comboBoxTrigger.click();
						window.setTimeout(() => {
							const items = [...baseComboBox?.shadowRoot?.querySelectorAll('lightning-base-combobox-item')];
							const item = isSetByIndex ? items[value] : items?.find(e => e.innerText.trim() === value);
							if (item) {
								item.click();
								resolve();
							} else {
								reject('error');
								return;
							}
						}, 100);
					}, 100);
				} else {
					reject('error');
					return;
				}
			}).catch(e => reject(e));
		});
	},

	getAttribute: function (element, attributeName, postProcessor, isJsProperty = true, autowaits = []) {
		return new Promise((resolve, reject) => {
			if (!element) {
				resolve(null);
			}
			let textElement = element;
			if (element.nodeType === Node.TEXT_NODE) {
				textElement = element.parentElement;
			}
			scrollIntoViewCenter(textElement);
			let waits = ['attached', 'visible'];
			if (autowaits?.length && Array.isArray(autowaits)) {
				waits = autowaits;
			}
			actionability.waitFor(waits, textElement).then(() => {
				let value = null;
				const isObjectProperty = attributeName.includes('.');
				if (!isObjectProperty) {
					value = isJsProperty && element[attributeName] !== null && element[attributeName] !== undefined
						? element[attributeName] : element.getAttribute(attributeName);
				} else {
					const keys = attributeName.split('.');
					let elem = element;
					for (let key of keys) {
						value = elem[key];
						elem = value;
						if (!value) {
							break;
						}
					}
				}
				if (postProcessor) {
					const postPrFunction = new Function('value', postProcessor);
					value = postPrFunction(value);
				}
				resolve(value);
			}).catch(e => reject(e));
		});
	},

	setAttribute: function (element, attribute, value, eventsAfter, elementLabel, eventsBefore, autowaits) {
		return new Promise((resolve, reject) => {
			scrollIntoViewCenter(element);
			const lastLogEntry = logEntries[logEntries.length - 1];
			elementLabel = !elementLabel ? element.tagName.toLowerCase() : elementLabel;
			lastLogEntry.diagnosticLogs.push(new LogEntry(LOGGING_LEVEL.DIAGNOSTIC, 'Executing set interaction for element : ' + elementLabel));
			let waits = ['attached', 'visible', 'stable', 'receives events', 'enabled'];
			if (autowaits?.length && Array.isArray(autowaits)) {
				waits = autowaits;
			}
			actionability.waitFor(waits, element).then(() => {
				let inputElem = element;
				if (element.tagName !== 'INPUT') {
					inputElem = element.shadowRoot?.querySelector('input')
						|| element.querySelector('lightning-primitive-cell-checkbox')?.shadowRoot?.querySelector('input')
						|| element;
				}
				if (inputElem) {
					if (eventsBefore?.length && Array.isArray(eventsBefore)) {
						for (const event of eventsBefore) {
							window.setTimeout(function () {
								inputElem.dispatchEvent(new Event(event));
							}, 25);
						}
					}
					inputElem[attribute] = value;
					if (eventsAfter?.length && Array.isArray(eventsAfter)) {
						for (const event of eventsAfter) {
							window.setTimeout(function () {
								inputElem.dispatchEvent(new Event(event));
							}, 25);
						}
					}
					resolve();
				} else {
					reject('error');
				}

			}).catch(e => reject(e));
		});
	},

	setLightningListDualBox: function (element, value, isSetByIndex = false, selectByEvent = false) {
		return new Promise((resolve, reject) => {
			scrollIntoViewCenter(element);
			const selectOption = (option, selectButton) => {
				const ulElement = element.shadowRoot.querySelector('ul[data-source-list]');
				let selectSpan;
				if (ulElement) {
					if (!isSetByIndex) {
						const spanInnerText = "span[title='" + option + "']";
						selectSpan = ulElement.querySelector(spanInnerText);
					} else {
						const liElement = ulElement.querySelectorAll('li')[value];
						if (liElement) {
							selectSpan = liElement.querySelector('span');
						}
					}
					if (selectSpan) {
						if (selectByEvent) {
							selectSpan.dispatchEvent(new PointerEvent('click', { bubbles: true }));
							selectButton.dispatchEvent(new PointerEvent('click', { bubbles: true }));
						} else {
							selectSpan.click();
							selectButton.click();
						}
					}
				}
			};
			actionability.waitFor(['attached', 'visible', 'enabled', 'editable'], element).then(() => {
				const delimiter = value.includes(';') ? ';' : ',';
				const valuesToSet = value.split(delimiter).map(val => val.trim());
				let selectButton = element.shadowRoot?.querySelector('lightning-button-icon')?.shadowRoot?.querySelector('lightning-primitive-icon')?.shadowRoot?.querySelector('svg[data-key="right"]');
				selectButton = selectButton?.closest('lightning-button-icon');
				if (selectButton) {
					valuesToSet.forEach(value => selectOption(value, selectButton));
					resolve();
				} else {
					reject('Select button not found')
				}
			}).catch(err => {
				reject(err);
			})
		})
	},

	selectOption: function (element, value) {
		return new Promise((resolve, reject) => {
			const elem = element.shadowRoot.querySelector('lightning-picklist').shadowRoot.querySelector('lightning-combobox').shadowRoot.querySelector('lightning-base-combobox');
			scrollIntoViewCenter(elem);
			actionability.waitFor(['attached'], elem).then(() => {
				elem.inputText = value;
				resolve();
			}).catch(e => reject(e));
		});
	},

	expand: function (element) {
		return new Promise((resolve, reject) => {
			const lastLogEntry = logEntries[logEntries.length - 1];
			const activationElement = document.evaluate(".//section[(contains(@class,'slds-accordion__section'))]//button", element, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
			scrollIntoViewCenter(activationElement);
			actionability.waitFor(['attached', 'visible', 'receives events'], activationElement).then(() => {
				if (activationElement.closest('section.slds-is-open') != null) {
					lastLogEntry.diagnosticLogs.push(new LogEntry(LOGGING_LEVEL.DIAGNOSTIC, 'The Accordian section is already expanded.'));
					resolve();
					return;
				}
				activationElement.click();
				resolve();
			}).catch(e => reject(e));
		});
	},

	collapse: function (element) {
		return new Promise((resolve, reject) => {
			const lastLogEntry = logEntries[logEntries.length - 1];
			const activationElement = document.evaluate(".//section[(contains(@class,'slds-accordion__section'))]//button", element, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
			scrollIntoViewCenter(activationElement);
			actionability.waitFor(['attached', 'visible', 'receives events'], activationElement).then(() => {
				if (activationElement.closest('section.slds-is-open') == null) {
					lastLogEntry.diagnosticLogs.push(new LogEntry(LOGGING_LEVEL.DIAGNOSTIC, 'The Accordian section is already collapsed.'));
					resolve();
					return;
				}
				activationElement.click();
				resolve();
			}).catch(e => reject(e));
		});
	},

	selectTab: function (element) {
		return new Promise((resolve, reject) => {
			const tabSet = element.parentElement;
			const tabBar = tabSet.shadowRoot.querySelector('lightning-tab-bar').shadowRoot.querySelector('a');
			scrollIntoViewCenter(tabBar);
			actionability.waitFor(['attached', 'visible', 'receives events'], tabBar).then(() => {
				tabSet.activeTabValue = element.value;
				resolve();
			}).catch(e => reject(e));
		});
	},

	setForDate: function (element, value) {
		const datePicker = element.shadowRoot.querySelector('lightning-datepicker').shadowRoot.querySelector('input');
		return new Promise((resolve, reject) => {
			interactions.set(datePicker, value, 'lightning-datepicker').then(() => {
				datePicker.dispatchEvent(new Event('change'));
				datePicker.dispatchEvent(new Event('focusout'));
				resolve();
			}).catch(e => reject(e));
		});
	},

	setForTime: function (element, value) {
		const timePicker = element.shadowRoot.querySelector('lightning-timepicker').shadowRoot.querySelector('lightning-base-combobox').shadowRoot.querySelector('input');
		return new Promise((resolve, reject) => {
			interactions.set(timePicker, value, 'lightning-timepicker').then(() => {
				timePicker.dispatchEvent(new Event('change'));
				timePicker.dispatchEvent(new Event('blur'));
				resolve();
			}).catch(e => reject(e));
		});
	},

	uploadFiles: function (input, value) {
		const filePayloads = JSON.parse(value);
		const files = filePayloads.map(fileMap => {
			const bytes = new Uint8Array(JSON.parse(fileMap.content))
			return new File([bytes], fileMap.name, { type: fileMap.mimeType });
		});
		scrollIntoViewCenter(input);
		const dataTransfer = new DataTransfer();
		for (const file of files) {
			dataTransfer.items.add(file);
		}
		input.files = dataTransfer.files;
		input.dispatchEvent(new Event('input', { 'bubbles': true }));
	},

	lightningUploadFiles: function (element, value) {
		return new Promise((resolve, reject) => {
			scrollIntoViewCenter(element);
			actionability.waitFor(['attached', 'visible', 'stable', 'receives events', 'enabled'], element).then(() => {
				let input;
				const isLightningUpload = element.tagName === 'LIGHTNING-FILE-UPLOAD';
				if (isLightningUpload) {
					element = element.shadowRoot.querySelector('lightning-input');
				}
				input = element;
				if (input && input.shadowRoot.querySelector('lightning-primitive-input-file')) {
					input = input.shadowRoot.querySelector('lightning-primitive-input-file');
				}
				input = input && input.shadowRoot.querySelector('input');
				interactions.uploadFiles(input, value);
				if (!isLightningUpload) {
					window.setTimeout(() => {
						input.dispatchEvent(new Event('change', { 'bubbles': true }));
					}, 100);
					resolve();
					return;
				}
				input.dispatchEvent(new Event('change', { 'bubbles': true }));
				actionability.waitFor(['fileUploadPopup'], input, 2000).then(() => {
					actionability.waitFor(['fileUpload'], input).then(() => {
						const button = document.querySelector("div.slds-fade-in-open:has(h1)")?.querySelector("div.modal-footer")?.querySelector("button");
						if (button) {
							window.setTimeout(function () {
								button.click();
							}, 100);
						}
						resolve();
					}).catch(e => reject(e));
				}).catch(e => {
					if (element && element.shadowRoot.querySelector('lightning-primitive-input-file')) {
						element = element.shadowRoot.querySelector('lightning-primitive-input-file');
					}
					const errorMessage = element.shadowRoot.querySelector('div.slds-form-element__help');
					if (errorMessage?.textContent) {
						reject(e);
					}
					resolve();
				});
			}).catch(e => reject(e));
		});
	},

	setForRadioGroup: function (element, label) {
		return new Promise((resolve, reject) => {
			scrollIntoViewCenter(element);
			actionability
				.waitFor(["attached", "visible", "stable"], element)
				.then(() => {
					const options = JSON.parse(JSON.stringify(element.options));
					const value = options.find((option) => option.label === label)?.value;
					if (value) {
						const inputElement = element.shadowRoot?.querySelector('input[value="' + value + '"]');
						if (inputElement) {
							inputElement.click();
						} else {
							element.value = value;
							const events = ["change", "blur"];
							for (const event of events) {
								element.dispatchEvent(new Event(event));
							}
						}
						resolve();
					} else {
						reject("error");
						return;
					}
				})
				.catch((e) => reject(e));
		});
	},

	htmlUploadFiles: function (element, value) {
		return new Promise((resolve, reject) => {
			actionability.waitFor(['attached', 'visible', 'stable', 'enabled'], element).then(() => {
				interactions.uploadFiles(element, value);
				if (!element.value || element.value === '') {
					reject();
				} else {
					resolve();
				}
			}).catch(e => reject(e));
		});
	},
	setInline_Edit: function (element, value) {
		return new Promise((resolve, reject) => {
			scrollIntoViewCenter(element);
			const lastLogEntry = logEntries[logEntries.length - 1];
			lastLogEntry.diagnosticLogs.push(new LogEntry(LOGGING_LEVEL.DIAGNOSTIC, `Executing ${value} interaction for element`));

			actionability.waitFor(['attached', 'visible', 'stable'], element).then(() => {
				const elem = element.shadowRoot.querySelector('button');
				if (elem) {
					elem.click();
				}

				window.setTimeout(() => {
					const inputElem = element.closest('lightning-datatable').shadowRoot
						.querySelector('lightning-primitive-datatable-iedit-panel')
						?.shadowRoot
						.querySelector('lightning-primitive-datatable-iedit-type-factory')
						?.shadowRoot
						.querySelector('lightning-input');

					try {
						if (inputElem) {
							inputElem.value = value;
							const buttonForm = inputElem.closest('lightning-primitive-datatable-iedit-panel').shadowRoot.querySelector('button');
							if (buttonForm) {
								buttonForm.click();
							}
							resolve();
						} else {
							reject('Input element not found within the edit panel');
						}
					} catch (error) {
						reject(error);
					}
				}, 100);
			}).catch(reject);
		});
	},
	setDateInline_Edit: function (element, value) {
		return new Promise((resolve, reject) => {
			scrollIntoViewCenter(element);
			const lastLogEntry = logEntries[logEntries.length - 1];
			lastLogEntry.diagnosticLogs.push(new LogEntry(LOGGING_LEVEL.DIAGNOSTIC, `Executing ${value} interaction for element`));
			actionability.waitFor(['attached', 'visible', 'stable'], element).then(() => {
				const elem = element.shadowRoot.querySelector('button');
				if (elem) {
					elem.click();
				}

				window.setTimeout(() => {
					const inputElem = element.closest('lightning-datatable').shadowRoot
						.querySelector('lightning-primitive-datatable-iedit-panel')
						?.shadowRoot
						.querySelector('lightning-primitive-datatable-iedit-type-factory')
						?.shadowRoot
						.querySelector('lightning-input');

					try {
						if (inputElem) {
							const date = new Date(value);
							if (isNaN(date.getTime())) {
								reject('Invalid date format entered')
							} else {
								const year = date.getUTCFullYear();
								const month = String(date.getUTCMonth() + 1).padStart(2, '0');
								const day = String(date.getUTCDate() + 1).padStart(2, '0');
								const formattedValue = `${year}-${month}-${day}`;
								inputElem.value = formattedValue;
								const formButton = inputElem.closest('lightning-primitive-datatable-iedit-panel').shadowRoot.querySelector('button');
								if (formButton) {
									formButton.click();
									const datePickerElement = inputElem.shadowRoot
										?.querySelector('lightning-datetimepicker').shadowRoot
										?.querySelector('lightning-datepicker');
									if (datePickerElement?.className?.includes('has-error')) {
										reject('Invalid date entered');
									} else {
										resolve();
									}
								} else {
									reject('Can\'t submit inline edit value');
								}
							}
						} else {
							reject('Input element not found within the edit panel');
						}
					} catch (error) {
						reject(error);
					}
				}, 100);
			}).catch(reject);
		});
	},

	performHeaderActions: function (element, value) {
		return new Promise((resolve, reject) => {
			scrollIntoViewCenter(element);
			const lastLogEntry = logEntries[logEntries.length - 1];
			lastLogEntry.diagnosticLogs.push(new LogEntry(LOGGING_LEVEL.DIAGNOSTIC, `Executing ${value} interaction for element`));
			actionability.waitFor(['attached'], element).then(() => {
				const buttonMenu = element.shadowRoot.querySelector('lightning-primitive-header-actions').shadowRoot.querySelector('lightning-button-menu');
				buttonMenu?.click();
				window.setTimeout(() => {
					const elem = [...element.shadowRoot.querySelector('lightning-primitive-header-actions').shadowRoot.querySelector('lightning-button-menu').querySelectorAll('lightning-menu-item')].find(m => m.innerText === value);
					if (elem) {
						interactions.click(elem);
						resolve();
					} else {
						reject();
					}
				}, 100);
			}).catch(e => reject(e));
		});
	},
};