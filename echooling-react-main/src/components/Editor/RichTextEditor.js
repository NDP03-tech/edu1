import React from 'react';
import { Editor } from '@tinymce/tinymce-react';

const RichTextEditor = ({ value, onChange, onCreateGap, onCreateMultipleGap, onDeleteGap, onAddHint, onCreateDropdown }) => {
  console.log("📥 Editor receives value:", value);
  
  return (
    <Editor
      apiKey="n37usgxk136y7jbgbd22rrry2ki2agrdp3zzkfg8gc0adi22"
      value={value}
      init={{
        height: 400,
        menubar: false,
        extended_valid_elements:
          'a[class|href|name|target|data-answer|data-options|data-answers|contenteditable],' +
          'span[class|data-hint|title|contenteditable],' +
          'span[class|data-hint|data-answers|contenteditable]',

        valid_elements: '*[*]',
        valid_children: '+body[span],+span[span],+body[a],+span[a]',
        
        plugins: [
          'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview', 'anchor',
          'searchreplace', 'visualblocks', 'code', 'fullscreen',
          'insertdatetime', 'media', 'table', 'help', 'wordcount'
        ],
        
        toolbar:
          ' createGap createMultipleGap deleteGap hintWord dropdownButton | bold italic underline | bullist numlist outdent indent | link image code',
          file_picker_types: 'image',
          file_picker_callback: function (callback, value, meta) {
            if (meta.filetype === 'image') {
              const input = document.createElement('input');
              input.setAttribute('type', 'file');
              input.setAttribute('accept', 'image/*');
          
              input.onchange = function () {
                const file = this.files[0];
          
                const img = new Image();
                const url = URL.createObjectURL(file);
          
                img.onload = function () {
                  const formData = new FormData();
                  formData.append('file', file);
          
                  fetch('http://localhost:5000/api/upload-media', {
                    method: 'POST',
                    body: formData
                  })
                    .then((res) => res.json())
                    .then((json) => {
                      if (json.fileUrl) {
                        callback(json.fileUrl, {
                          alt: file.name || "",
                          width: img.width,
                          height: img.height,
                          style: `width: ${img.width}px; height: auto;`
                        });
                      } else {
                        alert('Không nhận được URL ảnh từ server');
                      }
                    })
                    .catch((err) => {
                      alert('Lỗi upload ảnh: ' + err.message);
                    });
          
                  URL.revokeObjectURL(url);
                };
          
                img.src = url;
              };
          
              input.click();
            }
          },
          
          
        // ** Cấu hình upload ảnh **
        images_upload_url: 'http://localhost:5000/api/upload-media',
 // URL backend upload ảnh

 images_upload_handler: (blobInfo, success, failure) => {
  const formData = new FormData();
  formData.append('file', blobInfo.blob(), blobInfo.filename());

  fetch('http://localhost:5000/api/upload-media', {
    method: 'POST',
    body: formData,
  })
    .then((res) => res.json())
    .then((json) => {
      if (json.fileUrl) {
        success(json.fileUrl); // Gán vào `src`
      } else {
        failure('Không nhận được fileUrl từ backend');
      }
    })
    .catch((err) => {
      failure('Lỗi upload: ' + err.message);
    });
},




        setup: function (editor) {

          editor.ui.registry.addMenuButton('dropdownButton', {
            text: 'Dropdown',
            fetch: (callback) => {
              const selectedText = editor.selection.getContent({ format: 'text' }).trim();
              if (!selectedText) {
                alert("Please select text first.");
                return;
              }

              editor.windowManager.open({
                title: 'Enter Options',
                body: {
                  type: 'panel',
                  items: [
                    {
                      type: 'htmlpanel',
                      html: `<p><strong>Selected Text (Correct Answer):</strong> ${selectedText}</p>`
                    },
                    { type: 'input', name: 'value1', label: 'Option 1' },
                    { type: 'input', name: 'value2', label: 'Option 2' },
                    { type: 'input', name: 'value3', label: 'Option 3' }
                  ]
                },
                buttons: [
                  { type: 'submit', text: 'Insert Dropdown', primary: true },
                  { type: 'cancel', text: 'Cancel' }
                ],
                onSubmit: (api) => {
                  const data = api.getData();
                  const options = [
                    selectedText,
                    data.value1,
                    data.value2,
                    data.value3
                  ].filter(opt => opt && opt.trim() !== '');

                  const encodedOptions = JSON.stringify(options).replace(/"/g, '&quot;');
                  const dropdownHTML = `<a class="cloze dropdown" data-answer="${selectedText}" data-options="${encodedOptions}" href="#">${selectedText}<span class="dropdown-icon">&#9660;</span></a>`;

                  editor.insertContent(dropdownHTML);

                  if (onCreateDropdown) {
                    onCreateDropdown({
                      correct_answer: selectedText,
                      options,
                      position: editor.selection.getRng().startOffset,
                      length: selectedText.length
                    });
                  }
                  api.close();
                }
              });
            }
          });

          editor.ui.registry.addButton('createGap', {
            text: 'Create Gap',
            onAction: function () {
              const selectedText = editor.selection.getContent({ format: 'text' }).trim();
              if (selectedText) {
                const content = editor.getContent({ format: 'text' });
                const startPosition = content.indexOf(selectedText);
                onCreateGap && onCreateGap(selectedText, startPosition);
                const gapHTML = `<a class="cloze" href="#">${selectedText}</a>`;
                editor.selection.setContent(gapHTML);
              } else {
                alert("Please select text to create a gap.");
              }
            }
          });

          editor.ui.registry.addButton('deleteGap', {
            text: 'Delete Gap',
            onAction: function () {
              const selectedNode = editor.selection.getNode();
              if (selectedNode.tagName === 'A' && selectedNode.classList.contains('cloze')) {
                const innerText = selectedNode.textContent;
                editor.selection.select(selectedNode);
                editor.selection.setContent(innerText);
                if (onDeleteGap) {
                  onDeleteGap(innerText);
                }
              } else {
                alert("Please select a gap to delete.");
              }
            }
          });

          editor.ui.registry.addButton('hintWord', {
            text: 'Hint ',
            onAction: function () {
              const selectedText = editor.selection.getContent({ format: 'text' }).trim();
              if (!selectedText) {
                alert("Please select text to add a hint.");
                return;
              }

              editor.windowManager.open({
                title: 'Add/Edit Hint',
                body: {
                  type: 'panel',
                  items: [
                    { type: 'htmlpanel', html: `<p><strong>Gap Word:</strong> ${selectedText}</p>` },
                    { type: 'textarea', name: 'hint', label: 'Hint' }
                  ]
                },
                buttons: [
                  { type: 'submit', text: 'Create', primary: true },
                  { type: 'cancel', text: 'Cancel' }
                ],
                onSubmit: function (api) {
                  const data = api.getData();
                  const hintText = data.hint?.trim();
                  if (!hintText) {
                    alert("Please enter a hint.");
                    return;
                  }

                  const encodedHint = hintText.replace(/"/g, '&quot;');
                  const gapHTML = `
                    <span class="hint-wrapper">
                      <span class="cloze">${selectedText}</span>
                      <span class="hint-icon" data-hint="${encodedHint}">💡</span>
                    </span>
                  `;
                  editor.insertContent(gapHTML);

                  if (typeof onAddHint === 'function') {
                    onAddHint(selectedText, hintText);
                  }

                  api.close();
                }
              });
            }
          });

          editor.ui.registry.addButton('createMultipleGap', {
            text: 'Multiple Gaps',
            onAction: function () {
              const selectedText = editor.selection.getContent({ format: 'text' }).trim();
              if (!selectedText || !selectedText.includes('#')) {
                alert("Use '#' to separate multiple correct answers. E.g., here#there#at home");
                return;
              }

              const answers = selectedText.split('#').map(ans => ans.trim()).filter(Boolean);
              const encodedAnswers = JSON.stringify(answers).replace(/"/g, '&quot;');

              const firstVisible = selectedText;
              const content = editor.getContent({ format: 'text' });
              const startPosition = content.indexOf(selectedText);

              const gapHTML = `<a class="cloze" data-answers="${encodedAnswers}" href="#">${firstVisible}</a>`;
              editor.selection.setContent(gapHTML);

              if (onCreateMultipleGap) {
                onCreateMultipleGap(selectedText, startPosition);
              }
            }
          });

        },

        content_style: `.hint-wrapper {
          display: inline-block;
          position: relative;
        }
        
        .hint-icon {
          position: relative;
          font-size: 0.8em;
          margin-left: 4px;
          cursor: pointer;
          box-sizing: border-box;
        }
        
        .hint-icon::after {
          content: attr(data-hint);
          position: absolute;
          top: -36px;
          left: 100%;
          transform: translateX(10px) translateY(0);
          transform-origin: top left;
          background-color: #333;
          color: #fff;
          padding: 6px 10px;
          border-radius: 6px;
          white-space: nowrap;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.3s ease;
          z-index: 9999;
          box-sizing: border-box;
          margin: 0;
          padding: 0;
          border: 0;
          font-size: 13px;
          font-family: sans-serif;
          line-height: 1.5;
          text-align: left;
          vertical-align: baseline;
        }
        
        .hint-icon:hover::after {
          opacity: 1;
        }`,
      }}
      onEditorChange={(content) => onChange(content)}
    />
  );
};

export default RichTextEditor;
