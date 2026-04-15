import * as React from 'react'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Collapse from '@mui/material/Collapse'

import DirectionsCarIcon from '@mui/icons-material/DirectionsCar'
import HomeIcon from '@mui/icons-material/Home'
import ExpandLess from '@mui/icons-material/ExpandLess'
import ExpandMore from '@mui/icons-material/ExpandMore'
import PeopleAltIcon from '@mui/icons-material/PeopleAlt'
import FactCheckIcon from '@mui/icons-material/FactCheck'
import WalletIcon from '@mui/icons-material/Wallet'
import NightlifeIcon from '@mui/icons-material/Nightlife'
import SavingsIcon from '@mui/icons-material/Savings'
import ChildCareIcon from '@mui/icons-material/ChildCare'
import OutputIcon from '@mui/icons-material/Output'

export default function NestedList() {
  const [openIncome, setOpenIncome] = React.useState(true)

  const handleClickIncome = () => {
    setOpenIncome(!openIncome)
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
          <ListItemButton component="a" href="/expense/child" sx={{ pl: 4 }}>
            <ListItemIcon>
              <ChildCareIcon />
            </ListItemIcon>
            <ListItemText primary="子供" />
          </ListItemButton>
        </List>
        <List component="div" disablePadding>
          <ListItemButton component="a" href="/expense/car" sx={{ pl: 4 }}>
            <ListItemIcon>
              <DirectionsCarIcon />
            </ListItemIcon>
            <ListItemText primary="車" />
          </ListItemButton>
        </List>
        <List component="div" disablePadding>
          <ListItemButton component="a" href="/expense/living" sx={{ pl: 4 }}>
            <ListItemIcon>
              <WalletIcon />
            </ListItemIcon>
            <ListItemText primary="生活費" />
          </ListItemButton>
        </List>
        <List component="div" disablePadding>
          <ListItemButton component="a" href="/expense/other" sx={{ pl: 4 }}>
            <ListItemIcon>
              <NightlifeIcon />
            </ListItemIcon>
            <ListItemText primary="趣味" />
          </ListItemButton>
        </List>
      </Collapse>

      <ListItemButton component="a" href="/income">
        <ListItemIcon>
          <SavingsIcon />
        </ListItemIcon>
        <ListItemText primary="収入" />
      </ListItemButton>

      <ListItemButton component="a" href="/results">
        <ListItemIcon>
          <FactCheckIcon />
        </ListItemIcon>
        <ListItemText primary="結果" />
      </ListItemButton>
    </List>
  )
}
