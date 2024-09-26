const { test, describe, expect, beforeEach, afterEach } = require('@playwright/test')


describe('When regular user has logged in to Gambler app', () => {

    let tournamentId

    beforeEach(async ({ page, request }) => {

        const response = await request.post('http://localhost:3001/api/testing/insert')
  

        const id  = await response.json()
        tournamentId = id

        await request.post('http://localhost:3001/api/users', {
          data: {
            username: 'user',
            password: 'Password1!',
            admin: false
          }
        })
        await page.goto('http://localhost:5173/login')
          await page.getByTestId('username').fill('user')
          await page.getByTestId('password').fill('Password1!')
          await page.getByRole('button', { name: 'Login' }).click()
          await expect(page.getByText('user logged in')).toBeVisible()
          await page.goto('http://localhost:5173')
    
    })

    afterEach(async ({ page, request }) => {
        await request.post('http:localhost:3001/api/testing/reset')
    })


    test('a home page can be opened', async ({ page }) => {
        await expect(page.getByText('Welcome to the Gambler app!')).toBeVisible()
        await expect(page.getByText('The current administrators are:')).toBeVisible()
        await expect(page.getByText('user logged in')).toBeVisible()
        await expect(page.getByText('testAdmin')).toBeVisible()
        await expect(page.getByText('Tournaments')).toBeVisible()
        page.getByRole('button', { name: 'Logout' })

    })
        
    test('a tournament can be selected from the dropdown', async ({ page }) => {
        const dropdown = page.locator('#tournament-select')
        await expect(dropdown).toBeVisible()
        await dropdown.click()
        await dropdown.selectOption({ value: tournamentId })
        await expect(dropdown).toHaveValue(tournamentId)
    })
        
    test('admin tools are not visible', async ({ page }) => {
        await expect(page.getByRole('link', { name: 'Admin tools' })).not.toBeVisible()
    })
        
    test('a games page can be opened', async ({ page }) => {
        await page.getByRole('link', { name: 'Games' }).click()
        await expect(page.getByText('Games')).toBeVisible()
        await expect(page.getByText('There are no games added to selected tournament')).toBeVisible()

    })

    test('games are rendered', async ({ page }) => {
        await page.getByRole('link', { name: 'Games' }).click()
        const dropdown = page.locator('#tournament-select')
        await dropdown.click()
        await dropdown.selectOption({ value: tournamentId })
        await expect(page.getByText('Games in tournament tournament')).toBeVisible()
        await expect(page.getByText('future')).toBeVisible()
        await expect(page.getByText('past')).not.toBeVisible()
        await expect(page.getByRole('radio', { name: 'Hide admin tools' })).not.toBeVisible()
        await expect(page.getByRole('radio', { name: 'Show admin tools' })).not.toBeVisible()
        await expect(page.getByRole('radio', { name: 'Show only future games' })).toBeVisible()
        await expect(page.getByRole('radio', { name: 'Show all games' })).toBeVisible()
        await expect(page.getByRole('radio', { name: 'Show all games' })).click()
        await expect(page.getByText('past')).toBeVisible()

    })
   
})  
