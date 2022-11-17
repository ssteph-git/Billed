/**
 * @jest-environment jsdom
 */

import { screen, fireEvent } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill, { validFileType } from "../containers/NewBill.js"
import { ROUTES } from "../constants/routes.js";
import mockStore from "../__mocks__/store";

//Util pour tests: de la validation des fichiers: avec de vrai fichiers
import fs from 'fs';
import path from 'path';

//Vérification d'un formulaire vide au début
describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then the values ​​are empty", () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      //to-do write assertion
      const inputTypeDepense = screen.getByTestId("expense-type");
      expect(inputTypeDepense.value).toBe("Transports");

      const nomDepense = screen.getByTestId("expense-name");
      expect(nomDepense.value).toBe("");

      const dateDepense = screen.getByTestId("datepicker");
      expect(dateDepense.value).toBe("");

      const montantDepense = screen.getByTestId("amount");
      expect(montantDepense.value).toBe("");

      const montantTVAvat = screen.getByTestId("vat");
      expect(montantTVAvat.value).toBe("");

      const montantTVApct = screen.getByTestId("pct");
      expect(montantTVApct.value).toBe("");

      const commentaire = screen.getByTestId("commentary");
      expect(commentaire.value).toBe("");

      const fichier = screen.getByTestId("file");
      expect(fichier.value).toBe("");

    })

//Vérification que les données restent remplit après leurs écritures
    test("Then the values ​​remain filled after writing them", () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      //to-do write assertion
      const typeDepense = screen.getByTestId("expense-type");
      fireEvent.change(typeDepense, { target: { value: "Transports" } });
      expect(typeDepense.value).toBe("Transports");

      const nomDepense = screen.getByTestId("expense-name");
      fireEvent.change(nomDepense, { target: { value: "téléphonie" } });
      expect(nomDepense.value).toBe("téléphonie");

      let montantDepense = screen.getByTestId("amount");
      fireEvent.change(montantDepense, {target: { value: 23 }});
      expect(parseFloat(montantDepense.value)).toBe(23);

      const montantTVAvat = screen.getByTestId("vat");
      fireEvent.change(montantTVAvat, { target: { value: 2 } });
      expect(Number(montantTVAvat.value)).toBe(2);

      const montantTVApct = screen.getByTestId("pct");
      fireEvent.change(montantTVApct, { target: { value: 10 } });
      expect(Number(montantTVApct.value)).toBe(10);

      const commentaire = screen.getByTestId("commentary");
      fireEvent.change(commentaire, { target: { value: "En déplacement" } });
      expect(commentaire.value).toBe("En déplacement");

      const fichier = screen.getByTestId("file");

      fireEvent.change(fichier, {
        target: {
          files: [new File(["facturefreemobile.jpg"], "facturefreemobile.jpg", { type: "image/jpg" })],
        },
      });
      expect(fichier.files[0].name).toBe("facturefreemobile.jpg");
    })

    //Vérification bon chargement de la page NewBill
    test("Then the page loads fine", () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      html.onNavigate;

      const exist = screen.getByTestId("form-new-bill");
      let YesExist = exist.hasChildNodes();
      expect(YesExist).toBe(true);

    })

    //Vérification après validation du formulaire: on retourne bien sur la page Bill
    //POST new bill
    test("Then, after pressing the button: we return to the billing page", () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      document.body.innerHTML = NewBillUI();

      const newbill = new NewBill({
        document, onNavigate, store: null, localStorage: window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee',
          email: "a@a"
        }))
      });

      const inputName = screen.getByTestId("expense-name");
      fireEvent.change(inputName, { target: { value: "Déjeunet" } });
      expect(inputName.value).toBe("Déjeunet");


      let submit = screen.findByText("btn-send-bill")
      const button = screen.getByRole('button');
      fireEvent.click(button)

      const message = screen.getByText(/Mes notes/i)
      expect(message).toBeTruthy();

    })

    //Vérification que le fichier chargé est toujours présent (après chargement)
    test("Then after loading a file, the file is there", async () => {
      jest.spyOn(mockStore, "bills")
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      document.body.innerHTML = NewBillUI();

      const newbill = new NewBill({
        document, onNavigate, store: mockStore, localStorage: window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee',
          email: "a@a"
        }))
      });


      const handleChangeFile = jest.fn(newbill.handleChangeFile);

      const fileInput = screen.getByTestId("file");
      fileInput.addEventListener("change", handleChangeFile);
     
      var contentType = 'image/jpg';
      fireEvent.change(fileInput, {
            target: {
              files: [new File(["facturefreemobile.jpg"], "facturefreemobile.jpg", { type: contentType })],
                    },
        });

      const valid = screen.getByTestId("valid");
      expect(valid.style.display).toBe("none");
      expect(fileInput.files[0].type).toBe("image/jpg");
    })
  })
})

describe('Given a file to download', () => {
  describe('when i need to download it', () => {
    //Vérification si le fichier est bien valide
    test("Then, we check if the file is valid", () => {
      //Test possible: avec un vrai fichier:
      /*const reponse = fs.readFileSync(path.resolve(__dirname, "../assets/images/facturefreemobile.jpg"));
      const fileBon = new File([reponse], 'facturefreemobile.jpg', {
        type: "image/jpg",
      })*/
      //Test fichier valide: jpg, png...
      const fileBon = new File([], 'facturefreemobile.jpg', {
        type: "image/jpg",
      })
      let verifBon = validFileType(fileBon);
      expect(verifBon).toBe(true);
    })

    //Vérification si le fichier est bien invalide
    test("Then, we check if the file is not valid", () => {
      //Test possible: avec un vrai fichier:
      /*const reponse = fs.readFileSync(path.resolve(__dirname, "../assets/images/facturefreemobile.jpg"));
      const fileMauvais = new File([reponse], 'facturefreemobile.jpg', {
        type: "image/jpg",
      })*/
      //Test fichier valide: jpg, png...

      //Test fichier non valide: pdf au lieu de jpg,...
      const fileMauvais = new File([], 'facturefreemobile.pdf', {
        type: "application/pdf",
      })
      let verifMauvais = validFileType(fileMauvais);
      expect(verifMauvais).toBe(false);
    })
  })
})