import {
  Button,
  ButtonGroup,
  Divider,
  Grid,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { Container } from "@mui/system";
import logo from "../../assets/image/logo.svg";
import login_img from "../../assets/image/login-img.png";
import style from "./Login.module.css";
import {
  MicrosoftLoginButton,
  GoogleLoginButton,
  GithubLoginButton,
} from "react-social-login-buttons";
import { Link, useNavigate } from "react-router-dom";
import {
  getAuth,
  GithubAuthProvider,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import FirebaseApp from "../../services/firebaseApp";
import {
  federatedLogin,
  loginWithEmailAndPassword,
} from "../../redux/slices/userSlice";
import { setError } from "../../redux/slices/errorsSlice";
import { useDispatch, useSelector } from "react-redux";
import ErrorManager from "../../resources/ErrorManager";
import { useEffect } from "react";
import { useFormik } from "formik";

const Login = (props) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const firebaseAuth = getAuth(FirebaseApp);
  firebaseAuth.languageCode = "es";
  const toGoAfterLogin = useSelector(
    (state) => state.navigation.toGoAfterLogin
  );
  const currentUser = useSelector((state) => state.users.currentUser);
  const lang = useSelector((state) => state.lang.currentLangData);

  const googleAuthProvider = new GoogleAuthProvider();
  const githubAuthProvider = new GithubAuthProvider();

  const LoginWithEmailAndPassword = (e, value) => {
    e.preventDefault();
    const emailInput = e.target.querySelector("#email-input");
    const passwordInput = e.target.querySelector("#password-input");

    // console.log(emailInput.value, value);
    dispatch(loginWithEmailAndPassword(emailInput.value, passwordInput.value));
  };

  const loginWithGoogle = () => {
    signInWithPopup(firebaseAuth, googleAuthProvider)
      .then((result) => {
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const user = result.user;

        if (user) {
          user.getIdToken().then((tkn) => {
            dispatch(federatedLogin(tkn, user));
          });
        }
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        const credential = GoogleAuthProvider.credentialFromError(error);
      });
  };

  const loginWithGithub = () => {
    signInWithPopup(firebaseAuth, githubAuthProvider)
      .then((result) => {
        const credential = GithubAuthProvider.credentialFromResult(result);
        const user = result.user;

        if (user) {
          user.getIdToken().then((tkn) => {
            dispatch(federatedLogin(tkn, user));
          });
        }
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        const email = error.customData.email;
        const credential = GithubAuthProvider.credentialFromError(error);

        console.log(error.name);
        dispatch(
          setError(
            ErrorManager.CreateErrorInfoObject(error, [
              { code: errorCode },
              { email },
            ])
          )
        );
      });
  };

  useEffect(() => {
    if (currentUser) {
      if (toGoAfterLogin) {
        navigate(toGoAfterLogin);
      } else {
        navigate("/");
      }
    }
  }, [toGoAfterLogin, currentUser, lang]);

  return (
    <div className={style.login_div}>
      <Container style={{ minHeight: "100vh", display: "flex", width: "100%" }}>
        <Grid
          container
          spacing={4}
          alignItems="center"
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Grid item lg={7} sx={{ display: { lg: "block", xs: "none" } }}>
            <img src={login_img} className={style.imgLogin} />
          </Grid>
          <Grid item lg={1}></Grid>
          <Grid item lg={4} md={8}>
            <Paper style={{ paddingBottom: 20 }}>
              <Grid
                container
                spacing={2}
                flexDirection={"column"}
                alignItems={"center"}
              >
                <Grid item>
                  <img className={style.logo} src={logo} />
                </Grid>
                <Grid item>
                  <Typography
                    component="h1"
                    sx={{ color: "#FF3041", fontWeight: "Bold" }}
                  >
                    {lang.iniciarSesion.titles.bienvenido}
                  </Typography>
                </Grid>
              </Grid>
              <form onSubmit={LoginWithEmailAndPassword}>
                <Grid
                  container
                  spacing={2}
                  flexDirection={"column"}
                  alignItems={"center"}
                  sx={{ padding: "80px" }}
                >
                  <Grid item sx={{ width: "100%" }}>
                    <TextField
                      sx={{ width: "100%" }}
                      type="email"
                      size="small"
                      id="email-input"
                      label={lang.iniciarSesion.inputs.correo}
                      required
                      variant="standard"
                      className={style.input_width}
                    />
                  </Grid>
                  <Grid item sx={{ width: "100%" }}>
                    <TextField
                      sx={{ width: "100%" }}
                      size="small"
                      id="password-input"
                      type="password"
                      label={lang.iniciarSesion.inputs.contraseña}
                      required
                      variant="standard"
                      className={style.input_width}
                    />
                  </Grid>
                  <Grid
                    item
                    sx={{
                      width: "100%",
                      display: "flex",
                      justifyContent: "center",
                    }}
                  >
                    <Link to="/restore-password" className={style.link}>
                      {lang.iniciarSesion.labels.olvidoContraseña}
                    </Link>
                  </Grid>
                  <Grid item sx={{ width: "100%" }}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="yellowButton"
                      size="medium"
                      sx={{ width: "100%", borderRadius: "20px" }}
                      className={style.input_width}
                    >
                      {lang.iniciarSesion.buttons.continuar}
                    </Button>
                  </Grid>
                </Grid>
              </form>
              <Grid
                container
                spacing={2}
                flexDirection={"column"}
                alignItems={"center"}
              >
                <Grid item>
                  <Divider className={style.divider} />
                </Grid>
                <Grid item>
                  <ButtonGroup orientation="vertical">
                    <GithubLoginButton
                      iconSize="16px"
                      onClick={loginWithGithub}
                      color="secondary"
                      variant="outlined"
                      className={style.input_width + " " + style.auth_button}
                    >
                      <span>
                        {lang.iniciarSesion.buttons.continuarConGitHub}
                      </span>
                    </GithubLoginButton>
                    <GoogleLoginButton
                      iconSize="16px"
                      onClick={loginWithGoogle}
                      color="secondary"
                      variant="outlined"
                      className={style.input_width + " " + style.auth_button}
                    >
                      <span>
                        {lang.iniciarSesion.buttons.continuarConGoogle}
                      </span>
                    </GoogleLoginButton>
                  </ButtonGroup>
                </Grid>
                <Grid item>
                  <Divider className={style.divider} />
                </Grid>
                <Grid
                  item
                  display={"flex"}
                  justifyContent={"space-around"}
                  alignItems={"center"}
                  className={style.input_width}
                >
                  <Typography component="p" sx={{ margin: "10px 0px" }}>
                    {lang.iniciarSesion.labels.noRegistrado}
                  </Typography>
                  <Link to={"/registro-usuario"} className={style.link}>
                    {lang.iniciarSesion.labels.registrate}
                  </Link>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </div>
  );
};

export default Login;
