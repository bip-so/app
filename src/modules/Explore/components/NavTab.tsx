import { UnderlineNav, Text } from "@primer/react";
import useDeviceDimensions from "../../../hooks/useDeviceDimensions";
import { TabType } from "../types";
interface INavTabProps {
  tab: TabType;
}

const NavTab: React.FunctionComponent<INavTabProps> = ({ tab }) => {
  const { isTabletOrMobile } = useDeviceDimensions();
  return (
    <UnderlineNav.Link
      as="button"
      onClick={tab.onClick}
      sx={{ width: isTabletOrMobile ? "70px" : "100px" }}
      selected={tab.isSelected}
    >
      <Text sx={{ fontWeight: tab.isSelected ? 600 : 400 }}>{tab.name}</Text>
    </UnderlineNav.Link>
  );
};

export default NavTab;
