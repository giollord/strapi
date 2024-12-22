import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Box, Card, CardAsset, CardBody, CardContent, CardHeader, CardSubtitle, CardTitle } from '@strapi/design-system';
import styled from 'styled-components';
import { EmptyPictures } from '@strapi/icons/symbols';

interface SortableItemProps {
  id: string;
  title: string;
  subtitle: string;
  thumbnailUri: string;
}

const StyledDiv = styled.div`
  width: 100%;
  align-self: flex-start;
`;

const StyledCard = styled(Card)`
  width: 100%;
  align-self: flex-start;
`;

const StyledHeader = styled(CardHeader)`
  width: 100%;
  padding-top: 100%;
  position: relative;
`;

const Header1to1Container = styled(Box)`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
`;

export const SortableItem = (props: SortableItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: props.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  return (
    <StyledDiv ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <StyledCard>
        <StyledHeader>
          <Header1to1Container>
            {props.thumbnailUri &&
              <CardAsset src={props.thumbnailUri} />}
            {!props.thumbnailUri &&
              <EmptyPictures style={{ width: "100%", height: "auto" }} />}
          </Header1to1Container>
        </StyledHeader>
        {(props.title || props.subtitle) && (
          <CardBody>
            <CardContent>
              {props.title && <CardTitle>{props.title}</CardTitle>}
              {props.subtitle && <CardSubtitle>{props.subtitle}</CardSubtitle>}
            </CardContent>
          </CardBody>
        )}
      </StyledCard>
    </StyledDiv>
  );
}
