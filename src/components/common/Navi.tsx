import * as React from 'react'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Collapse from '@mui/material/Collapse'

import WorkIcon from '@mui/icons-material/Work'
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar'
import HomeIcon from '@mui/icons-material/Home'
import ExpandLess from '@mui/icons-material/ExpandLess'
import ExpandMore from '@mui/icons-material/ExpandMore'
import PeopleAltIcon from '@mui/icons-material/PeopleAlt'
import FactCheckIcon from '@mui/icons-material/FactCheck'
import WalletIcon from '@mui/icons-material/Wallet'
import NightlifeIcon from '@mui/icons-material/Nightlife'
import SavingsIcon from '@mui/icons-material/Savings'
import InputIcon from '@mui/icons-material/Input'
import OutputIcon from '@mui/icons-material/Output'
import RealEstateAgentIcon from '@mui/icons-material/RealEstateAgent'

export default function NestedList() {
  const [openIncome, setOpenIncome] = React.useState(true)
  const [openExpenses, setOpenExpenses] = React.useState(true)

  const handleClickIncome = () => {
    setOpenIncome(!openIncome)
  }

  const handleClickExpenses = () => {
    setOpenExpenses(!openExpenses)
  }

  return (
    <List sx={{ width: '100%', maxWidth: 200, flexShrink: 0 }} component="nav" aria-labelledby="nested-list-subheader">
      <ListItemButton component="a" href="/">
        <ListItemIcon>
          <HomeIcon />
        </ListItemIcon>
        <ListItemText primary="TOP" />
      </ListItemButton>
      <ListItemButton component="a" href="/family">
        <ListItemIcon>
          <PeopleAltIcon />
        </ListItemIcon>
        <ListItemText primary="家族構成" />
      </ListItemButton>
      <ListItemButton onClick={handleClickIncome}>
        <ListItemIcon>
          <OutputIcon />
        </ListItemIcon>
        <ListItemText primary="支出" />
        {openIncome ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>
      <Collapse in={openIncome} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          <ListItemButton component="a" href="/expense/home" sx={{ pl: 4 }}>
            <ListItemIcon>
              <HomeIcon />
            </ListItemIcon>
            <ListItemText primary="住宅" />
          </ListItemButton>
        </List>
        <List component="div" disablePadding>
          <ListItemButton component="a" href="/family" sx={{ pl: 4 }}>
            <ListItemIcon>
              <DirectionsCarIcon />
            </ListItemIcon>
            <ListItemText primary="車" />
          </ListItemButton>
        </List>
        <List component="div" disablePadding>
          <ListItemButton component="a" href="/family" sx={{ pl: 4 }}>
            <ListItemIcon>
              <WalletIcon />
            </ListItemIcon>
            <ListItemText primary="生活費" />
          </ListItemButton>
        </List>
        <List component="div" disablePadding>
          <ListItemButton component="a" href="/family" sx={{ pl: 4 }}>
            <ListItemIcon>
              <NightlifeIcon />
            </ListItemIcon>
            <ListItemText primary="趣味" />
          </ListItemButton>
        </List>
      </Collapse>

      <ListItemButton onClick={handleClickExpenses}>
        <ListItemIcon>
          <InputIcon />
        </ListItemIcon>
        <ListItemText primary="収入" />
        {openExpenses ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>
      <Collapse in={openExpenses} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          <ListItemButton component="a" href="/family" sx={{ pl: 4 }}>
            <ListItemIcon>
              <SavingsIcon />
            </ListItemIcon>
            <ListItemText primary="貯金" />
          </ListItemButton>
          <ListItemButton component="a" href="/family" sx={{ pl: 4 }}>
            <ListItemIcon>
              <WorkIcon />
            </ListItemIcon>
            <ListItemText primary="給与" />
          </ListItemButton>
          <ListItemButton component="a" href="/family" sx={{ pl: 4 }}>
            <ListItemIcon>
              <RealEstateAgentIcon />
            </ListItemIcon>
            <ListItemText primary="その他" />
          </ListItemButton>
        </List>
      </Collapse>

      <ListItemButton component="a" href="/results">
        <ListItemIcon>
          <FactCheckIcon />
        </ListItemIcon>
        <ListItemText primary="結果" />
      </ListItemButton>
    </List>
  )
}
