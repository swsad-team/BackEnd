import { signJwtToken, decodeJwtToken} from './auth'

test('encode {data: "success"} and then decode it', () => {
  let payload = {
    data: 'success'
  }
  let decode = decodeJwtToken(signJwtToken(payload))
  expect(decode.data).toBe('success')
})