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
  keep1to1AspectRatio: boolean;
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
  const sortable = useSortable({ id: props.id });
  const { setNodeRef, isDragging, listeners, attributes, transition, transform } = sortable

  const transitionStr = [transition || (!isDragging && 'transform 0.2s ease')].concat('opacity 0.5s ease').filter(x=>x).join(', ');

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition: transitionStr,
    zIndex: isDragging ? 100 : undefined,
    opacity: isDragging ? 0.75 : 1,
  };

  return (
    <StyledDiv ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <StyledCard>
        {props.keep1to1AspectRatio &&
          <StyledHeader>
            <Header1to1Container>
              {props.thumbnailUri &&
                <CardAsset src={props.thumbnailUri} />}
              {!props.thumbnailUri &&
                <EmptyPictures style={{ width: "100%", height: "auto" }} />}
            </Header1to1Container>
          </StyledHeader>}
        {!props.keep1to1AspectRatio &&
          <CardHeader>
            {props.thumbnailUri &&
              <CardAsset src={props.thumbnailUri} style={{ objectFit: "contain" }} />}
            {!props.thumbnailUri &&
              <EmptyPictures style={{ objectFit: "contain" }} />}
          </CardHeader>}
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
