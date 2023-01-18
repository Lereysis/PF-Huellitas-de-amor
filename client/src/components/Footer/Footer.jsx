import React from 'react'
import { Box, Container, Grid, Typography } from '@mui/material'
import TextField from '@mui/material/TextField';
import { Link } from 'react-router-dom'
import style from "./Footer.module.css"

const Footer = () => {
  return (
    <Box className={style['bg-footer']}>
        <Container>
            <Grid container justifyContent="space-between" className={style.footer}>
                <Grid item md={4}>
                    <Box>
                        <Typography component={Link}>
                            Inicio
                        </Typography>
                        <Typography component="span">
                            Lorem ipsum dolor sit.
                        </Typography>
                    </Box>
                    <Box sx={{marginTop:1.5}}>
                        <Typography component={Link}>
                            Inicio
                        </Typography>
                        <Typography component="span">
                            Lorem ipsum dolor sit.
                        </Typography>
                    </Box>
                </Grid>
                <Grid item md={4}>
                    <Box>
                        <Typography component={Link}>
                            Inicio
                        </Typography>
                        <Typography component="span">
                            Lorem ipsum dolor sit.
                        </Typography>
                    </Box>
                    <Box sx={{marginTop:1.5}}>
                        <Typography component={Link}>
                            Inicio
                        </Typography>
                        <Typography component="span">
                            Lorem ipsum dolor sit.
                        </Typography>
                    </Box>
                </Grid>
                <Grid item md={4}>
                <Box>
                    <Typography component={Link}>
                            Inicio
                        </Typography>
                        <Typography component="span">
                            Lorem ipsum dolor sit.
                        </Typography>
                    </Box>
                    <Box sx={{marginTop:1.5}}>
                    <TextField id="standard-basic" label="Tu email" variant="standard" color="warning" />
                    {/* <TextField id="outlined-basic" label="Tu email" variant="outlined" className={style.newsletter} sx={{backgroundColor:"rgba(255,255,255, 18%)"}} color="warning"/>  */}
                    </Box>
                </Grid>
            </Grid>
        </Container>
    </Box>
  )
}

export default Footer