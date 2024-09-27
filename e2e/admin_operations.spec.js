const { test, describe, expect, beforeEach, afterEach } = require('@playwright/test')


describe('When admin has logged in to Gambler app', () => {

    beforeEach(async ({ page, request }) => {

        await request.post('http://localhost:3001/api/testing/insert')
        await request.post('http://localhost:3001/api/users', {
          data: {
            username: 'admin',
            password: 'Password1!',
            admin:true
          }
        })
        await page.goto('http://localhost:5173/login')
        await page.getByTestId('username').fill('admin')
        await page.getByTestId('password').fill('Password1!')
        await page.getByRole('button', { name: 'Login' }).click()
        await expect(page.getByText('admin logged in')).toBeVisible()
        await page.goto('http://localhost:5173')
    
    })

    afterEach(async ({ page, request }) => {
        await request.post('http:localhost:3001/api/testing/reset')
    })



    test('a home page can be opened', async ({ page }) => {
        await expect(page.getByText('Welcome to the Gambler app!')).toBeVisible()
        await expect(page.getByText('The current administrators are:')).toBeVisible()
        await expect(page.getByText('admin logged in')).toBeVisible()
        await expect(page.getByText('testAdmin')).toBeVisible()
        await expect(page.getByText('Tournaments')).toBeVisible()
        page.getByRole('button', { name: 'Logout' })

    })
        
    test('admin tools can be opened', async ({ page }) => {
        await page.getByRole('link', { name: 'Admin tools' }).click()
        await expect(page.getByText('Add a new tournament')).toBeVisible()
        page.getByRole('button', { name: 'Go back' })
    })
        
    test('new tournament can be added', async ({ page }) => {
        await page.getByRole('link', { name: 'Admin tools' }).click()
        await page.getByRole('link', { name: 'Add a new tournament' }).click()
        await page.getByTestId('tournamentname').fill('testTournament')
        const dateFromInput = page.locator('input[data-testid="from"]')
        await expect(dateFromInput).toBeVisible()
        await dateFromInput.fill('2100-01-01')
            
        const dateToInput = page.locator('input[data-testid="to"]')
        await expect(dateToInput).toBeVisible()
        await dateToInput.fill('2101-01-01')
        await page.getByRole('button', { name: 'Add' }).click()
        await expect(dateFromInput).toHaveValue('2100-01-01')
        await expect(dateToInput).toHaveValue('2101-01-01')
        await expect(page.getByText('Tournament added successfully!')).toBeVisible()
      
    })

    test('a tournament can be deleted', async ({ page }) => {
        await page.getByRole('link', { name: 'Admin tools' }).click()
        await page.getByRole('link', { name: 'Edit and remove tournaments' }).click()
        await expect(page.getByRole('radio', { name: `Don't show ended tournaments` })).toBeVisible()
        await expect(page.getByRole('radio', { name: `Show all tournaments` })).toBeVisible()
        await expect(page.getByRole('radio', { name: 'Hide admin tools' })).toBeVisible()
        await expect(page.getByRole('radio', { name: 'Show admin tools' })).toBeVisible()
        await page.getByRole('radio', { name: 'Show all tournaments' }).click()
        await page.getByRole('radio', { name: 'Show admin tools' }).click()
        await expect(page.getByRole('button', { name: 'Delete tournament' })).toBeVisible()
        await page.getByRole('button', { name: 'Delete tournament' }).click()
        await expect(page.getByText('Tournament deleted successfully!')).toBeVisible()
        await expect(page.getByText('There are no tournaments')).toBeVisible()
      
    })
})





