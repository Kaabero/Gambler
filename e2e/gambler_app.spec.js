const { test, describe, expect, beforeEach, afterEach } = require('@playwright/test')


describe('Gambler app', () => {

    beforeEach(async ({ page, request }) => {
        
        await request.post('http://localhost:3001/api/testing/insert')
        await request.post('http://localhost:3001/api/users', {
          data: {
            username: 'admin',
            password: 'Password1!',
            admin:true
          }
        })
    
    })



    test('login page can be opened', async ({ page }) => {
        await page.goto('http://localhost:5173/login')
      
        const locator = await page.getByText('Welcome to the Gambler app!')
        await expect(locator).toBeVisible()
        await expect(page.getByText('You can now compete with your betting group  for the title of the best score predictor!')).toBeVisible()
    })

    test('user can log in', async ({ page }) => {
        await page.goto('http://localhost:5173/login')
        await page.getByTestId('username').fill('admin')
        await page.getByTestId('password').fill('Password1!')
        await page.getByRole('button', { name: 'Login' }).click()
        await expect(page.getByText('admin logged in')).toBeVisible()
    })

    describe('when admin has logged in', () => {
        beforeEach(async ({ page }) => {
          await page.goto('http://localhost:5173/login')
          await page.getByTestId('username').fill('admin')
          await page.getByTestId('password').fill('Password1!')
          await page.getByRole('button', { name: 'Login' }).click()
          await expect(page.getByText('admin logged in')).toBeVisible()
          await page.goto('http://localhost:5173')
        })
    
        test('a home page can be opened', async ({ page }) => {
            await expect(page.getByText('Welcome to the Gambler app!')).toBeVisible()
            await expect(page.getByText('The current administrators are:')).toBeVisible()
            await expect(page.getByText('Tournaments')).toBeVisible()
            page.getByRole('button', { name: 'Logout' })

        }) 
        
        test('admin tools can be opened', async ({ page }) => {
            await page.getByRole('link', { name: 'Admin tools' }).click()
            await expect(page.getByText('Add a new tournament')).toBeVisible()
        })
        
        test('new tournament can be added', async ({ page }) => {
            await page.getByRole('link', { name: 'Admin tools' }).click()
            await page.getByRole('link', { name: 'Add a new tournament' }).click()
            await page.getByTestId('tournamentname').fill('testTournament')
            const dateFromInput = page.locator('input[data-testid="from"]')
            await expect(dateFromInput).toBeVisible()
            await dateFromInput.fill('2025-01-01')
            
            const dateToInput = page.locator('input[data-testid="to"]')
            await expect(dateToInput).toBeVisible()
            await dateToInput.fill('2027-01-01')
            await page.getByRole('button', { name: 'Add' }).click()
            await expect(dateFromInput).toHaveValue('2025-01-01')
            await expect(dateToInput).toHaveValue('2027-01-01')
      
        })


   
    })  
})





