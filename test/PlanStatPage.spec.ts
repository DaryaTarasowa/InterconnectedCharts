import {expect, Page, test} from '@playwright/test';

type getPixelColorProps = {
    page: Page, locator: string, x: number, y: number
}

const getPixelColor = async ({page, locator, x, y}: getPixelColorProps): Promise<string> => {
    const canvas = page.locator(locator);

    return await canvas.evaluate(
        (el, {x, y}) => {
            const ctx = (el as HTMLCanvasElement).getContext('2d');
            if (!ctx) return 'rgba(0,0,0,0)';

            const [r, g, b, a] = ctx.getImageData(x, y, 1, 1).data;
            return `rgba(${r},${g},${b},${(a / 255).toFixed(2)})`;
        },
        {x, y}
    );
}

test('test', async ({page}) => {
    await page.goto('http://localhost:5173/');
    await expect(page.getByRole('heading')).toContainText('Plan Metrics');
    await page.locator('#planRunsDuration').click({
                                                      position: {
                                                          x: 380,
                                                          y: 138
                                                      }
                                                  });
    await expect(page.getByRole('checkbox', {name: 'Plan M'})).not.toBeChecked();
    expect(await getPixelColor({page, locator: '#planRunsDuration', x: 380, y: 138 })).toEqual("rgba(211,211,211,1.00)");
    await page.getByRole('checkbox', {name: 'Plan M'}).check();
    expect(await getPixelColor({page, locator: '#planRunsDuration', x: 380, y: 138 })).toEqual("rgba(70,130,180,1.00)");
    await page.getByRole('button', {name: 'Select all'}).click();
});