const { test, describe, expect, beforeEach, afterEach } = require('@playwright/test')


describe('When regular user has logged in to Gambler app', () => {

    let tournamentId

    beforeEach(async ({ page, request }) => {

        const response = await request.post('http://localhost:3001/api/testing/insert')
  

        const id  = await response.json()
        tournamentId = id.toString()
    

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

    afterEach(async ({ request }) => {
        await request.post('http:localhost:3001/api/testing/reset')
    })


    test('a home page can be opened', async ({ page }) => {
        await expect(page.getByText('Welcome to the Gambler app!')).toBeVisible()
        await expect(page.getByText('The current administrators are:')).toBeVisible()
        await expect(page.getByText('user logged in')).toBeVisible()
        await expect(page.getByText('testAdmin')).toBeVisible()
        await expect(page.getByText('Tournaments')).toBeVisible()

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
        await expect(page.getByText('There are no games added to selected tournament')).toBeVisible()

    })

    test('future and past games are rendered properly', async ({ page }) => {
        await page.getByRole('link', { name: 'Games' }).click()
        const dropdown = page.locator('#tournament-select')
        await dropdown.click()
        await dropdown.selectOption({ value: tournamentId })
        await expect(page.getByRole('radio', { name: 'Hide admin tools' })).not.toBeVisible()
        await expect(page.getByRole('radio', { name: 'Show admin tools' })).not.toBeVisible()
        await expect(page.getByRole('radio', { name: 'Show only future games' })).toBeVisible()
        await expect(page.getByRole('radio', { name: 'Show all games' })).toBeVisible()
        await expect(page.getByText('past')).not.toBeVisible()
        await expect(page.getByText('upcoming')).toBeVisible()
        await page.getByRole('radio', { name: 'Show all games' }).click()
        await expect(page.getByText('past')).toBeVisible()
        await page.getByRole('radio', { name: 'Show only future games' }).click()
        await expect(page.getByText('past')).not.toBeVisible()
        await expect(page.getByText('upcoming')).toBeVisible()
    })

    describe('Bet management', () => {

        beforeEach(async ({ page }) => {
            const dropdown = page.locator('#tournament-select')
            await dropdown.click()
            await dropdown.selectOption({ value: tournamentId })
            await page.getByRole('link', { name: 'Games' }).click()
            
        })

        test('a bet can be added', async ({ page }) => {
        
            await page.getByRole('button', { name: 'Add bet' }).click()
            await expect(page.getByText('Add a new bet')).toBeVisible()
            const homeGoalsInput = page.locator('input[data-testid="home_goals"]')
            await expect(homeGoalsInput).toBeVisible()
            await homeGoalsInput.fill("2")
                
            const visitorGoalsInput = page.locator('input[data-testid="visitor_goals"]')
            await expect(visitorGoalsInput).toBeVisible()
            await visitorGoalsInput.fill("3")
    
            await page.getByRole('button', { name: 'Add bet' }).click()
            await expect(homeGoalsInput).toHaveValue("2")
            await expect(visitorGoalsInput).toHaveValue("3")
            await expect(page.getByText('Bet added successfully!')).toBeVisible()
            await expect(page.getByRole('button', { name: 'Add bet' })).not.toBeVisible()
            
        })

        test('a added bet is rendered and future bet can be edited', async ({ page }) => {
        
            await page.getByRole('button', { name: 'Add bet' }).click()
            const homeGoalsInput = page.locator('input[data-testid="home_goals"]')
            await expect(homeGoalsInput).toBeVisible()
            await homeGoalsInput.fill("253")
            const visitorGoalsInput = page.locator('input[data-testid="visitor_goals"]')
            await expect(visitorGoalsInput).toBeVisible()
            await visitorGoalsInput.fill("322")
            await page.getByRole('button', { name: 'Add bet' }).click()
            await expect(page.getByText('Bet added successfully!')).toBeVisible()
            await page.getByRole('link', { name: 'Check and manage your own bets' }).click()
            await expect(page.getByText('253')).toBeVisible()
            await expect(page.getByText('322')).toBeVisible()
            await expect(page.getByRole('radio', { name: 'Show only future games' })).toBeVisible()
            await expect(page.getByRole('radio', { name: 'Show all games' })).toBeVisible()
            await page.getByRole('radio', { name: 'Show only future games' }).click()
            await expect(page.getByRole('button', { name: 'Edit bet' })).toBeVisible()
            await page.getByRole('button', { name: 'Edit bet' }).click()

            await expect(page.getByText('Edit the bet')).toBeVisible()

            const editHomeGoalsInput = page.locator('input[data-testid="home_goals"]')
            await expect(editHomeGoalsInput).toBeVisible()
            await editHomeGoalsInput.fill("511")
           
            await page.getByRole('button', { name: 'Save' }).click()
            await expect(editHomeGoalsInput).toHaveValue("511")

            await expect(page.getByText('Bet updated successfully!')).toBeVisible()
            await expect(page.getByText('511')).toBeVisible()
            await expect(page.getByText('322')).toBeVisible()

          
        })

        test('a bet without an outcome can be deleted', async ({ page }) => {
        
            await page.getByRole('button', { name: 'Add bet' }).click()
            const homeGoalsInput = page.locator('input[data-testid="home_goals"]')
            await expect(homeGoalsInput).toBeVisible()
            await homeGoalsInput.fill("253")
            const visitorGoalsInput = page.locator('input[data-testid="visitor_goals"]')
            await expect(visitorGoalsInput).toBeVisible()
            await visitorGoalsInput.fill("322")
            await page.getByRole('button', { name: 'Add bet' }).click()
            await expect(page.getByText('Bet added successfully!')).toBeVisible()
            await page.getByRole('link', { name: 'Check and manage your own bets' }).click()
            await expect(page.getByText('253')).toBeVisible()
            await expect(page.getByText('322')).toBeVisible()
            await expect(page.getByRole('radio', { name: 'Show only future games' })).toBeVisible()
            await expect(page.getByRole('radio', { name: 'Show all games' })).toBeVisible()
            await page.getByRole('radio', { name: 'Show only future games' }).click()
            await expect(page.getByRole('button', { name: 'Delete bet' })).toBeVisible()
            await page.getByRole('button', { name: 'Delete bet' }).click()
            await expect(page.getByText('Bet deleted successfully!')).toBeVisible()
            await expect(page.getByText('253')).not.toBeVisible()
            await expect(page.getByText('322')).not.toBeVisible()

          
        })

        test('all bets are rendered properly', async ({ page }) => {
        
            await page.getByRole('button', { name: 'Add bet' }).click()
            const homeGoalsInput = page.locator('input[data-testid="home_goals"]')
            await expect(homeGoalsInput).toBeVisible()
            await homeGoalsInput.fill("253")
            const visitorGoalsInput = page.locator('input[data-testid="visitor_goals"]')
            await expect(visitorGoalsInput).toBeVisible()
            await visitorGoalsInput.fill("322")
            await page.getByRole('button', { name: 'Add bet' }).click()
            await expect(page.getByText('Bet added successfully!')).toBeVisible()
            await page.getByRole('link', { name: 'All bets' }).click()
            await expect(page.getByRole('radio', { name: 'Hide admin tools' })).not.toBeVisible()
            await expect(page.getByRole('radio', { name: 'Show admin tools' })).not.toBeVisible()
            await expect(page.getByText('253')).toBeVisible()
            await expect(page.getByText('322')).toBeVisible()
            await expect(page.getByText('past')).not.toBeVisible()
            await expect(page.getByText('Bet from user testAdmin')).not.toBeVisible()
            await expect(page.getByRole('radio', { name: 'Show only future games' })).toBeVisible()
            await expect(page.getByRole('radio', { name: 'Show all games' })).toBeVisible()
            await page.getByRole('radio', { name: 'Show all games' }).click()
            await expect(page.getByText('past')).toBeVisible()
            await expect(page.getByText('322')).toBeVisible()
            await expect(page.getByText('without')).toBeVisible()
            await expect(page.getByText('2 - 2')).toBeVisible()

          
        })
       
    })
    
})  
