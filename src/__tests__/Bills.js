/**
 * @jest-environment jsdom
 */

 import {screen, waitFor} from "@testing-library/dom"
 import "@testing-library/jest-dom";
 import BillsUI from "../views/BillsUI.js"
 import { bills } from "../fixtures/bills.js"
 import {ROUTES_PATH} from "../constants/routes.js";
 import mockStore from "../__mocks__/store.js"
 import {localStorageMock} from "../__mocks__/localStorage.js";
 import userEvent from '@testing-library/user-event'
 import router from "../app/Router.js";
 
 jest.mock("../app/store", () => mockStore)



describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)

      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
  
      const styles = getComputedStyle(windowIcon);
      expect(windowIcon).toHaveClass("active-icon");
    })

    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })

    test("Then I click on the eye icon and the bill should appear", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))

      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()

      await waitFor(() => screen.queryAllByTestId('icon-eye'))
      const IconEye = screen.getAllByTestId("icon-eye")[1];

      $.fn.modal = jest.fn(() => modaleFile.classList.add("show"))
      const handleClick = jest.fn(IconEye.handleClick)
      
      IconEye.addEventListener('click', handleClick)
      userEvent.click(IconEye)

      expect(handleClick).toHaveBeenCalled()
    })

    //GET Bills
    test("Then the bills reports are loaded", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))

      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      document.body.innerHTML = BillsUI({ data: bills })
      let nb = bills.length;

      const tbody = screen.getByTestId('tbody')
      let exist = tbody.hasChildNodes();

       expect(exist).toBe(true);      
    })
  })


  describe("When an error occurs on API", () => {
    beforeEach(() => {
      jest.spyOn(mockStore, "bills")
      Object.defineProperty(
          window,
          'localStorage',
          { value: localStorageMock }
      )
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: "a@a"
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.appendChild(root)
      router()
    })

    test("fetches bills from an API and fails with 404 message error", async () => {

      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 404"))
          }
        }})
      window.onNavigate(ROUTES_PATH.Bills)
      await new Promise(process.nextTick);
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })

    test("fetches messages from an API and fails with 500 message error", async () => {

      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 500"))
          }
        }})

      window.onNavigate(ROUTES_PATH.Bills)
      await new Promise(process.nextTick);
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })
})







