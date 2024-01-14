import { SignUpController } from './signup'

/* Rota de cadastro
    Recebe -> nome/email/senha
    retorna -> conta do usuário criada
    Validar que os parâmetro irão vir corretamento do client(usuário)
    SUT -> system under test -> classe que está sendo testada no momento
*/

describe('SignUp Controller', () => {
  test('should return 400 if no name is provided', () => {
    const sut = new SignUpController()
    const httpRequest = {
      body: {
        email: 'any_email@mail.com',
        password: 'any_password',
        passwordConfirmation: 'any_password'
      }
    }

    // handle é a função do controlador que recebe o request e response e processa para retornar algo
    const httResponse = sut.handle(httpRequest)
    expect(httResponse.statusCode).toBe(400)
  })
})
