import { InvalidParamError, MissingParamError, ServerError } from '../errors'
import { EmailValidator } from '../protocols/email-validator'
import { SignUpController } from './signup'

/* Rota de cadastro
    Recebe -> nome/email/senha
    retorna -> conta do usuário criada
    Validar que os parâmetro irão vir corretamento do client(usuário)
    SUT -> system under test -> classe que está sendo testada no momento
*/
// Esse factory diminui a repetição em precisar injetar as dependências em cada um dos testes
interface SutTypes {
  sut: SignUpController
  emailValidatorStub: EmailValidator
}
const makeSut = (): SutTypes => {
  // STUB -> Funções com retornos predefinidos
  // Tanto faz a implementação do EmailValidator, só precisamos do retorno true ou false
  // para saber como o SignUpController irá lidar com esses dois retornos
  class EmailValidatorStub implements EmailValidator {
    // O ideal é que esse STUB sempre retorne true para os outros testes não quebarem
    // Apenas em testes específicos invertemos o valor desse mock
    // Sempre inicializar mock com o valor verdadeiro
    isValid (email: string): boolean {
      return true
    }
  }
  const emailValidatorStub = new EmailValidatorStub()
  const sut = new SignUpController(emailValidatorStub)

  return {
    sut,
    emailValidatorStub
  }
}

describe('SignUp Controller', () => {
  test('should return 400 if no name is provided', () => {
    const { sut } = makeSut()
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
    // não utilizar toBe para comparar objetos porque ele compara por ponteiro também
    expect(httResponse.body).toEqual(new MissingParamError('name'))
  })
  test('should return 400 if no email is provided', () => {
    const { sut } = makeSut()
    const httpRequest = {
      body: {
        name: 'any_name',
        password: 'any_password',
        passwordConfirmation: 'any_password'
      }
    }

    const httResponse = sut.handle(httpRequest)
    expect(httResponse.statusCode).toBe(400)
    expect(httResponse.body).toEqual(new MissingParamError('email'))
  })
  test('should return 400 if no password is provided', () => {
    const { sut } = makeSut()
    const httpRequest = {
      body: {
        name: 'any_name',
        email: 'any_email@mail.com',
        passwordConfirmation: 'any_password'
      }
    }

    const httResponse = sut.handle(httpRequest)
    expect(httResponse.statusCode).toBe(400)
    expect(httResponse.body).toEqual(new MissingParamError('password'))
  })
  test('should return 400 if no passwordConfirmation is provided', () => {
    const { sut } = makeSut()
    const httpRequest = {
      body: {
        name: 'any_name',
        email: 'any_email@mail.com',
        password: 'any_password'
      }
    }
    const httpResponse = sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new MissingParamError('passwordConfirmation'))
  })
  test('should return 400 if an invalid email is provided', () => {
    const { sut, emailValidatorStub } = makeSut()
    jest.spyOn(emailValidatorStub, 'isValid').mockReturnValueOnce(false)
    const httpRequest = {
      body: {
        name: 'any_name',
        email: 'invalid_email@mail.com',
        password: 'any_password',
        passwordConfirmation: 'any_password'
      }
    }
    const httpResponse = sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new InvalidParamError('email'))
  })

  // teste para garantir que a função isValid será chamada com o email correto
  test('Should call EmailValidator with correct email', () => {
    const { sut, emailValidatorStub } = makeSut()
    const isValidSpy = jest.spyOn(emailValidatorStub, 'isValid')

    const httpRequest = {
      body: {
        name: 'any_name',
        email: 'any_email@mail.com',
        password: 'any_password',
        passwordConfirmation: 'any_password'
      }
    }
    sut.handle(httpRequest)
    /*
      verifica se o método isActive foi chamado no handle do controller
      com o email que passamos no httpRequest
    */
    expect(isValidSpy).toHaveBeenCalledWith('any_email@mail.com')
  })

  // Garantir que o nosso controle está tratando as exceções disparadas nas camadas de baixo
  test('should return 500 if EmailValidator throws', () => {
    class EmailValidatorStub implements EmailValidator {
      isValid (email: string): boolean {
        throw new Error()
      }
    }
    const emailValidatorStub = new EmailValidatorStub()
    const sut = new SignUpController(emailValidatorStub)
    const httpRequest = {
      body: {
        name: 'any_name',
        email: 'any_email@mail.com',
        password: 'any_password',
        passwordConfirmation: 'any_password'
      }
    }
    const httpResponse = sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body).toEqual(new ServerError())
  })
})
