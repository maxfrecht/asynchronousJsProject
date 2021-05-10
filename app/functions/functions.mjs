import { Personnage } from "../classes/personnages.mjs";
let log = console.log;

// ? fonction qui affiche les personnages

function showCharacters(charactersArray, divBox) {
  divBox.innerHTML = "";

  charactersArray.forEach((character) => {
    showAddedCharacter(divBox,character);
  });

  addListeners(charactersArray);
}

function showAddedCharacter(divBox, newCharacter) {
    let characterBoxDivElement = document.createElement("div");
    characterBoxDivElement.classList.add("character");
    let pseudoTitleElement = document.createElement("h2");
    pseudoTitleElement.innerHTML = newCharacter.pseudo;
    let classeTitleElement = document.createElement("h3");
    classeTitleElement.innerHTML = newCharacter.classe;
    let descriptionCharacterElement = document.createElement("p");
    descriptionCharacterElement.innerHTML = `${newCharacter.description}<span></span>`;
    let imgAvatarElement = document.createElement("img");
    imgAvatarElement.src = newCharacter.avatar;
    let imgBoxElement = document.createElement("div");
    imgBoxElement.classList.add("character-img");
    imgBoxElement.appendChild(imgAvatarElement);

    let deleteButtonElement = document.createElement("button");
    deleteButtonElement.classList.add("delete");
    //ajout identifiant id
    deleteButtonElement.id = `delete-${newCharacter.id}`;
    deleteButtonElement.innerHTML = `<span class="material-icons">close</span>`;

    let updateButtonElement = document.createElement("button");
    //ajout identifiant id
    updateButtonElement.id = `update-${newCharacter.id}`;
    updateButtonElement.classList.add("update");
    updateButtonElement.innerHTML = `<span class="material-icons">edit</span>`;

    characterBoxDivElement.appendChild(pseudoTitleElement);
    characterBoxDivElement.appendChild(classeTitleElement);
    characterBoxDivElement.appendChild(imgBoxElement);
    characterBoxDivElement.appendChild(descriptionCharacterElement);
    characterBoxDivElement.appendChild(deleteButtonElement);
    characterBoxDivElement.appendChild(updateButtonElement);

    divBox.appendChild(characterBoxDivElement);
}

// ? fonction qui ajoute les écouteurs d'évènements

function addListeners(characters) {
  
  let deleteBtns = document.querySelectorAll(".delete");
  let dixBoxCharactersElement = document.querySelector(".characters");

  characters.forEach((character) => {
    let buttonDelete = document.querySelector(`#delete-${character.id}`);
    let buttonUpdate = document.querySelector(`#update-${character.id}`);

    buttonDelete.addEventListener("click", () => {

      let popUp = createPopup('Attention', 'Êtes-vous sur de vouloir effacer ce personnage ?');
      // document.body.appendChild(popUp);
      buttonDelete.parentElement.appendChild(popUp);
      buttonDelete.parentElement.classList.add('active-pop-up')

      let buttonConfirm = popUp.querySelector('.confirm');
      let buttonUnconfirm = popUp.querySelector('.unconfirm');

      buttonConfirm.addEventListener('click',() => {
        buttonDelete.parentElement.removeChild(popUp);
        buttonDelete.parentElement.classList.remove('active-pop-up')

        idCharacter = character.id;
      deleteCharacter(character.id, characters);
      });
      
      buttonUnconfirm.addEventListener('click', () => {
        buttonDelete.parentElement.removeChild(popUp);
        buttonDelete.parentElement.classList.remove('active-pop-up')
      })

    });
    
    buttonUpdate.addEventListener("click", () => {
      idCharacter = character.id
      getCharacter(characters, idCharacter); //fillForm
      update = true;
    });
  });
}

function createPopup(title, message) {
  let popUpDivElement = document.createElement('div');
  popUpDivElement.classList.add('pop-up');
  let titlePopUpElement = document.createElement('h2');
  titlePopUpElement.innerHTML = title;
  let popUpPElement = document.createElement('p');
  popUpPElement.innerHTML = message;
  let buttonConfirmElement = document.createElement('button');
  buttonConfirmElement.innerHTML = 'Oui';
  buttonConfirmElement.classList.add('confirm')
  let buttonUnconfirmElement = document.createElement('button');
  buttonUnconfirmElement.classList.add('unconfirm')
  buttonUnconfirmElement.innerHTML = 'Non';
  let buttonZoneElement = document.createElement('div');


  popUpDivElement.appendChild(titlePopUpElement);
  popUpDivElement.appendChild(popUpPElement);
  buttonZoneElement.appendChild(buttonConfirmElement);
  buttonZoneElement.appendChild(buttonUnconfirmElement);
  popUpDivElement.appendChild(buttonZoneElement)

  return popUpDivElement;
}

// ? fonction qui supprime un personnage

async function deleteCharacter(idCharacter, characters) {

  let divBoxCharactersElement = document.querySelector('.characters')
  let index = characters.findIndex(
    (character) => character.id === idCharacter
  );
  characters.splice(index, 1);
  let res = await deleteCharacterApi(idCharacter);
  let characterToRemove = document.querySelector(`#delete-${idCharacter}`).parentElement;
  divBoxCharactersElement.removeChild(characterToRemove);
}

async function deleteCharacterApi(idCharacter) {
  let opts = {
    method: 'DELETE'
  }
  let res = await fetch(`http://localhost:3000/personnage/${idCharacter}`, opts);

  return res
}

// ? fonction qui ajoute un personnage

function addCharacter(characters) {
  let formElement = document.querySelector('form');
  let formInputs = document.querySelectorAll("input, textarea");
  let newChar = new Personnage(
    characters[characters.length - 1].id + 1,
    formElement.pseudo.value,
    formElement.classe.value,
    formElement.description.value,
    formElement.avatar.value
  );
  postCharacter(newChar, characters);
  formInputs.forEach((formInput) => {
    formInput.value = "";
  });
}

// ? fonction qui ajoute un personnage a l' API

function postCharacter(characterToPost, characters) {
  let opts = {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body : JSON.stringify({
      pseudo: characterToPost.pseudo,
      classe:  characterToPost.classe,
      description: characterToPost.description,
      avatar: characterToPost.avatar
    })
  };
  fetch('http://localhost:3000/personnage', opts)
    .then((res) => res.json())
      .then(data => {
        let characterToPush = new Personnage(data._id, data.pseudo, data.classe, data.description, data.avatar);
        characters.push(characterToPush);
        let divBox = document.querySelector('.characters')
        showAddedCharacter(document.querySelector('.characters'),characterToPush);
        addListeners(characters)
      })
}

// ? fonction qui ajoute un écouteur d'évènement submit sur le formulaire (appel la modification ou l'ajout de personnage selon la variable update)

function onSubmit(characters) {
  let dixBoxCharactersElement = document.querySelector('.characters');
  let formElement = document.querySelector('form');

  formElement.addEventListener("submit", (e) => {
    e.preventDefault();

    if (update) {
      updateCharacter(characters, idCharacter);
      showCharacters(characters, dixBoxCharactersElement);
      update = false;

    } else {
      addCharacter(characters, formElement);
      update = false;
    }
  });
}

// ? fonction qui permet de modifier un personnage

function updateCharacter(characters, idCharacter) {
  let characterToUpdate = characters.find(c => c.id === idCharacter );
  let formElement = document.querySelector("form");
  let formInputs = document.querySelectorAll("input, textarea");
  characterToUpdate.classe = formElement.classe.value;
  characterToUpdate.description = formElement.description.value;
  characterToUpdate.avatar = formElement.avatar.value;
  characterToUpdate.pseudo = formElement.pseudo.value;
  formInputs.forEach((formInput) => {
    formInput.value = "";
  });

  putCharacter(idCharacter, characterToUpdate);
}

function putCharacter(idCharacter, characterToUpdate) {
  let opts = {
    method: 'PUT',
    headers: {
      "Content-Type" : "application/json"
    },
    body: JSON.stringify({
      pseudo: characterToUpdate.pseudo,
      classe: characterToUpdate.classe,
      description: characterToUpdate.description,
      avatar: characterToUpdate.avatar
    })
  }
  fetch(`http://localhost:3000/personnage/${idCharacter}`, opts);
}

// ? fonction qui permet de remplir le formulaire

function getCharacter(characters) {

  let formElement = document.querySelector('form')

  let characterToUpdate = characters.find(c => c.id === idCharacter );
  formElement.pseudo.value = characterToUpdate.pseudo;
  formElement.classe.value = characterToUpdate.classe;
  formElement.description.value = characterToUpdate.description;
  formElement.avatar.value = characterToUpdate.avatar;

}

// ? fonction qui charge l'application au démarage ou au changement d'élèment

function initApp(charactersArray) {
  charactersArray = [];
  let divElement = document.querySelector(".characters");
  let opts = { method: "GET" };

  fetch("http://localhost:3000/personnage", opts)
  .then(response => response.json())
    .then(data => {
      console.log(data);
      data.forEach(character => {
        let currentCharacter = new Personnage(character._id, character.pseudo, character.classe, character.description, character.avatar);
        charactersArray.push(currentCharacter)
      });
      showCharacters(charactersArray, divElement);
      onSubmit(charactersArray);
    })
}

let update = false;
let idCharacter = -1;

export {
  initApp
};
